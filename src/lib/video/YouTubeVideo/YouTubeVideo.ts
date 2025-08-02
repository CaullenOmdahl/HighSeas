/**
 * YouTube Video Implementation
 * Based on stremio-video-reference/src/YouTubeVideo/YouTubeVideo.js
 * Complete 1:1 implementation
 */

import EventEmitter from 'eventemitter3';
import cloneDeep from 'lodash.clonedeep';
import deepFreeze from 'deep-freeze';
import { ERROR } from '../error';

interface YouTubeVideoOptions {
    containerElement: HTMLElement;
    timeChangedTimeout?: number;
}

interface VideoAction {
    type: 'observeProp' | 'setProp' | 'command';
    propName?: string;
    propValue?: any;
    commandName?: string;
    commandArgs?: any;
}

interface SubtitleTrack {
    id: string;
    lang: string;
    label: string;
    origin: string;
    embedded: boolean;
}

// YouTube API types
declare global {
    interface Window {
        YT: any;
    }
    var YT: any;
}

function YouTubeVideo(options: YouTubeVideoOptions) {
    const timeChangedTimeout = options.timeChangedTimeout !== null && isFinite(options.timeChangedTimeout || 0) 
        ? parseInt(String(options.timeChangedTimeout), 10) : 100;

    const containerElement = options.containerElement;
    if (!(containerElement instanceof HTMLElement)) {
        throw new Error('Container element required to be instance of HTMLElement');
    }

    const apiScriptElement = document.createElement('script');
    apiScriptElement.type = 'text/javascript';
    apiScriptElement.src = 'https://www.youtube.com/iframe_api';
    apiScriptElement.onload = onAPILoaded;
    apiScriptElement.onerror = onAPIError;
    containerElement.appendChild(apiScriptElement);

    const videoContainerElement = document.createElement('div');
    videoContainerElement.style.width = '100%';
    videoContainerElement.style.height = '100%';
    videoContainerElement.style.backgroundColor = 'black';
    containerElement.appendChild(videoContainerElement);

    const timeChangedIntervalId = window.setInterval(() => {
        onPropChanged('time');
        onPropChanged('volume');
        onPropChanged('muted');
        onPropChanged('playbackSpeed');
    }, timeChangedTimeout);

    let video: any = null;
    let ready = false;
    let pendingLoadArgs: any = null;
    const events = new EventEmitter();
    let destroyed = false;
    let stream: any = null;
    let selectedSubtitlesTrackId: string | null = null;
    const observedProps: Record<string, boolean> = {
        stream: false,
        loaded: false,
        paused: false,
        time: false,
        duration: false,
        buffering: false,
        volume: false,
        muted: false,
        playbackSpeed: false,
        subtitlesTracks: false,
        selectedSubtitlesTrackId: false
    };

    function onAPIError() {
        if (destroyed) {
            return;
        }

        onError(Object.assign({}, ERROR.YOUTUBE_VIDEO.API_LOAD_FAILED, {
            critical: true
        }));
    }

    function onAPILoaded() {
        if (destroyed) {
            return;
        }

        if (!window.YT || typeof window.YT.ready !== 'function') {
            onAPIError();
            return;
        }

        window.YT.ready(() => {
            if (destroyed) {
                return;
            }

            if (!window.YT || !window.YT.PlayerState || typeof window.YT.Player !== 'function') {
                onAPIError();
                return;
            }

            video = new window.YT.Player(videoContainerElement, {
                width: '100%',
                height: '100%',
                playerVars: {
                    autoplay: 1,
                    cc_load_policy: 3,
                    controls: 0,
                    disablekb: 1,
                    enablejsapi: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    loop: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0
                },
                events: {
                    onError: onVideoError,
                    onReady: onVideoReady,
                    onApiChange: onVideoAPIChange,
                    onStateChange: onVideoStateChange
                }
            });
        });
    }

    function onVideoError(videoError: any) {
        if (destroyed) {
            return;
        }

        let error: any;
        switch (videoError.data) {
            case 2: {
                error = ERROR.YOUTUBE_VIDEO.INVALID_PARAMETER;
                break;
            }
            case 5: {
                error = ERROR.YOUTUBE_VIDEO.HTML5_VIDEO;
                break;
            }
            case 100: {
                error = ERROR.YOUTUBE_VIDEO.VIDEO_NOT_FOUND;
                break;
            }
            case 101:
            case 150: {
                error = ERROR.YOUTUBE_VIDEO.VIDEO_NOT_EMBEDDABLE;
                break;
            }
            default: {
                error = ERROR.UNKNOWN_ERROR;
            }
        }
        onError(Object.assign({}, error, {
            critical: true,
            error: videoError
        }));
    }

    function onVideoReady() {
        if (destroyed) {
            return;
        }

        ready = true;
        if (pendingLoadArgs !== null) {
            command('load', pendingLoadArgs);
            pendingLoadArgs = null;
        }
    }

    function onVideoAPIChange() {
        if (destroyed) {
            return;
        }

        if (typeof video.loadModule === 'function') {
            video.loadModule('captions');
        }
        if (typeof video.setOption === 'function') {
            video.setOption('captions', 'track', {});
        }
        onPropChanged('paused');
        onPropChanged('time');
        onPropChanged('duration');
        onPropChanged('buffering');
        onPropChanged('volume');
        onPropChanged('muted');
        onPropChanged('playbackSpeed');
        onPropChanged('subtitlesTracks');
        onPropChanged('selectedSubtitlesTrackId');
    }

    function onVideoStateChange(state: any) {
        onPropChanged('buffering');
        switch (state.data) {
            case window.YT.PlayerState.ENDED: {
                onEnded();
                break;
            }
            case window.YT.PlayerState.CUED:
            case window.YT.PlayerState.UNSTARTED:
            case window.YT.PlayerState.PAUSED:
            case window.YT.PlayerState.PLAYING: {
                onPropChanged('paused');
                onPropChanged('time');
                onPropChanged('duration');
                break;
            }
        }
    }

    function getProp(propName: string): any {
        switch (propName) {
            case 'stream': {
                return stream;
            }
            case 'loaded': {
                if (stream === null) {
                    return null;
                }
                return true;
            }
            case 'paused': {
                if (stream === null || typeof video.getPlayerState !== 'function') {
                    return null;
                }
                return video.getPlayerState() !== window.YT.PlayerState.PLAYING;
            }
            case 'time': {
                if (stream === null || typeof video.getCurrentTime !== 'function' || 
                    video.getCurrentTime() === null || !isFinite(video.getCurrentTime())) {
                    return null;
                }
                return Math.floor(video.getCurrentTime() * 1000);
            }
            case 'duration': {
                if (stream === null || typeof video.getDuration !== 'function' || 
                    video.getDuration() === null || !isFinite(video.getDuration())) {
                    return null;
                }
                return Math.floor(video.getDuration() * 1000);
            }
            case 'buffering': {
                if (stream === null || typeof video.getPlayerState !== 'function') {
                    return null;
                }
                return video.getPlayerState() === window.YT.PlayerState.BUFFERING;
            }
            case 'volume': {
                if (stream === null || typeof video.getVolume !== 'function' || 
                    video.getVolume() === null || !isFinite(video.getVolume())) {
                    return null;
                }
                return video.getVolume();
            }
            case 'muted': {
                if (stream === null || typeof video.isMuted !== 'function') {
                    return null;
                }
                return video.isMuted();
            }
            case 'playbackSpeed': {
                if (stream === null || typeof video.getPlaybackRate !== 'function' || 
                    video.getPlaybackRate() === null || !isFinite(video.getPlaybackRate())) {
                    return null;
                }
                return video.getPlaybackRate();
            }
            case 'subtitlesTracks': {
                if (stream === null || typeof video.getOption !== 'function') {
                    return [];
                }

                return (video.getOption('captions', 'tracklist') || [])
                    .filter((track: any) => track && typeof track.languageCode === 'string')
                    .map((track: any, index: number): SubtitleTrack => {
                        return Object.freeze({
                            id: 'EMBEDDED_' + String(index),
                            lang: track.languageCode,
                            label: typeof track.displayName === 'string' ? track.displayName : track.languageCode,
                            origin: 'EMBEDDED',
                            embedded: true
                        });
                    });
            }
            case 'selectedSubtitlesTrackId': {
                if (stream === null) {
                    return null;
                }
                return selectedSubtitlesTrackId;
            }
            default: {
                return null;
            }
        }
    }

    function onError(error: any) {
        events.emit('error', error);
        if (error.critical) {
            command('unload');
        }
    }

    function onEnded() {
        events.emit('ended');
    }

    function onPropChanged(propName: string) {
        if (observedProps[propName]) {
            events.emit('propChanged', propName, getProp(propName));
        }
    }

    function observeProp(propName: string) {
        if (observedProps.hasOwnProperty(propName)) {
            events.emit('propValue', propName, getProp(propName));
            observedProps[propName] = true;
        }
    }

    function setProp(propName: string, propValue: any) {
        switch (propName) {
            case 'paused': {
                if (stream !== null) {
                    propValue ?
                        typeof video.pauseVideo === 'function' && video.pauseVideo()
                        :
                        typeof video.playVideo === 'function' && video.playVideo();
                }
                break;
            }
            case 'time': {
                if (stream !== null && typeof video.seekTo === 'function' && propValue !== null && isFinite(propValue)) {
                    video.seekTo(parseInt(propValue, 10) / 1000);
                }
                break;
            }
            case 'volume': {
                if (stream !== null && propValue !== null && isFinite(propValue)) {
                    if (typeof video.unMute === 'function') {
                        video.unMute();
                    }
                    if (typeof video.setVolume === 'function') {
                        video.setVolume(Math.max(0, Math.min(100, parseInt(propValue, 10))));
                    }
                    onPropChanged('muted');
                    onPropChanged('volume');
                }
                break;
            }
            case 'muted': {
                if (stream !== null) {
                    propValue ?
                        typeof video.mute === 'function' && video.mute()
                        :
                        typeof video.unMute === 'function' && video.unMute();
                    onPropChanged('muted');
                }
                break;
            }
            case 'playbackSpeed': {
                if (stream !== null && typeof video.setPlaybackRate === 'function' && isFinite(propValue)) {
                    video.setPlaybackRate(propValue);
                    onPropChanged('playbackSpeed');
                }
                break;
            }
            case 'selectedSubtitlesTrackId': {
                if (stream !== null) {
                    selectedSubtitlesTrackId = null;
                    const selectedTrack = getProp('subtitlesTracks')
                        .find((track: SubtitleTrack) => track.id === propValue);
                    if (typeof video.setOption === 'function') {
                        if (selectedTrack) {
                            selectedSubtitlesTrackId = selectedTrack.id;
                            video.setOption('captions', 'track', {
                                languageCode: selectedTrack.lang
                            });
                            events.emit('subtitlesTrackLoaded', selectedTrack);
                        } else {
                            video.setOption('captions', 'track', {});
                        }
                    }
                    onPropChanged('selectedSubtitlesTrackId');
                }
                break;
            }
        }
    }

    function command(commandName: string, commandArgs?: any) {
        switch (commandName) {
            case 'load': {
                command('unload');
                if (commandArgs && commandArgs.stream && typeof commandArgs.stream.ytId === 'string') {
                    if (ready) {
                        stream = commandArgs.stream;
                        onPropChanged('stream');
                        onPropChanged('loaded');
                        const autoplay = typeof commandArgs.autoplay === 'boolean' ? commandArgs.autoplay : true;
                        const time = commandArgs.time !== null && isFinite(commandArgs.time) ? 
                            parseInt(commandArgs.time, 10) / 1000 : 0;
                        if (autoplay && typeof video.loadVideoById === 'function') {
                            video.loadVideoById({
                                videoId: commandArgs.stream.ytId,
                                startSeconds: time
                            });
                        } else if (typeof video.cueVideoById === 'function') {
                            video.cueVideoById({
                                videoId: commandArgs.stream.ytId,
                                startSeconds: time
                            });
                        }
                        onPropChanged('paused');
                        onPropChanged('time');
                        onPropChanged('duration');
                        onPropChanged('buffering');
                        onPropChanged('volume');
                        onPropChanged('muted');
                        onPropChanged('playbackSpeed');
                        onPropChanged('subtitlesTracks');
                        onPropChanged('selectedSubtitlesTrackId');
                    } else {
                        pendingLoadArgs = commandArgs;
                    }
                } else {
                    onError(Object.assign({}, ERROR.UNSUPPORTED_STREAM, {
                        critical: true,
                        stream: commandArgs ? commandArgs.stream : null
                    }));
                }
                break;
            }
            case 'unload': {
                pendingLoadArgs = null;
                stream = null;
                onPropChanged('stream');
                onPropChanged('loaded');
                selectedSubtitlesTrackId = null;
                if (ready && typeof video.stopVideo === 'function') {
                    video.stopVideo();
                }
                onPropChanged('paused');
                onPropChanged('time');
                onPropChanged('duration');
                onPropChanged('buffering');
                onPropChanged('volume');
                onPropChanged('muted');
                onPropChanged('playbackSpeed');
                onPropChanged('subtitlesTracks');
                onPropChanged('selectedSubtitlesTrackId');
                break;
            }
            case 'destroy': {
                command('unload');
                destroyed = true;
                events.removeAllListeners();
                clearInterval(timeChangedIntervalId);
                if (ready && typeof video.destroy === 'function') {
                    video.destroy();
                }
                containerElement.removeChild(apiScriptElement);
                containerElement.removeChild(videoContainerElement);
                break;
            }
        }
    }

    this.on = function(eventName: string, listener: (...args: any[]) => void) {
        if (destroyed) {
            throw new Error('Video is destroyed');
        }
        events.on(eventName, listener);
    };

    this.dispatch = function(action: VideoAction) {
        if (destroyed) {
            throw new Error('Video is destroyed');
        }

        if (action) {
            const frozenAction = deepFreeze(cloneDeep(action));
            switch (frozenAction.type) {
                case 'observeProp': {
                    observeProp(frozenAction.propName!);
                    return;
                }
                case 'setProp': {
                    setProp(frozenAction.propName!, frozenAction.propValue);
                    return;
                }
                case 'command': {
                    command(frozenAction.commandName!, frozenAction.commandArgs);
                    return;
                }
            }
        }

        throw new Error('Invalid action dispatched: ' + JSON.stringify(action));
    };
}

(YouTubeVideo as any).canPlayStream = function(stream: any) {
    return Promise.resolve(stream && typeof stream.ytId === 'string');
};

(YouTubeVideo as any).manifest = {
    name: 'YouTubeVideo',
    external: false,
    props: ['stream', 'loaded', 'paused', 'time', 'duration', 'buffering', 'volume', 'muted', 'playbackSpeed', 'subtitlesTracks', 'selectedSubtitlesTrackId'],
    commands: ['load', 'unload', 'destroy'],
    events: ['propValue', 'propChanged', 'ended', 'error', 'subtitlesTrackLoaded']
};

export default YouTubeVideo;