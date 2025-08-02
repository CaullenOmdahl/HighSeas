/**
 * IFrame Video Implementation
 * Based on stremio-video-reference/src/IFrameVideo/IFrameVideo.js
 * Complete 1:1 implementation
 */

import EventEmitter from 'eventemitter3';
import cloneDeep from 'lodash.clonedeep';
import deepFreeze from 'deep-freeze';
import { ERROR } from '../error';

interface IFrameVideoOptions {
    containerElement: HTMLElement;
}

interface VideoAction {
    type: 'observeProp' | 'setProp' | 'command';
    propName?: string;
    propValue?: any;
    commandName?: string;
    commandArgs?: any;
}

function IFrameVideo(options: IFrameVideoOptions) {
    const containerElement = options.containerElement;
    if (!(containerElement instanceof HTMLElement)) {
        throw new Error('Container element required to be instance of HTMLElement');
    }

    const iframeElement = document.createElement('iframe');
    iframeElement.style.width = '100%';
    iframeElement.style.height = '100%';
    iframeElement.style.border = '0';
    iframeElement.style.backgroundColor = 'black';
    (iframeElement as any).allowFullscreen = false;
    iframeElement.allow = 'autoplay';
    containerElement.appendChild(iframeElement);

    const events = new EventEmitter();
    let destroyed = false;
    const observedProps: Record<string, boolean> = {
        stream: false,
        loaded: false,
        paused: false,
        time: false,
        duration: false,
        buffering: false,
        buffered: false,
        volume: false,
        muted: false,
        playbackSpeed: false
    };

    function onMessage(event: MessageEvent) {
        if (event.source !== iframeElement.contentWindow) {
            return;
        }

        const data = event.data || (event as any).message;
        if (!data || typeof data.event !== 'string') {
            return;
        }

        const eventName = data.event;
        const args = Array.isArray(data.args) ? data.args : [];
        events.emit(eventName, ...args);
    }

    function sendMessage(action: VideoAction) {
        if (iframeElement.contentWindow) {
            iframeElement.contentWindow.postMessage(action, '*');
        }
    }

    function onError(error: any) {
        events.emit('error', error);
        if (error.critical) {
            command('unload');
        }
    }

    function onPropChanged(propName: string, propValue: any) {
        if (observedProps[propName]) {
            events.emit('propChanged', propName, propValue);
        }
    }

    function observeProp(propName: string) {
        if (observedProps.hasOwnProperty(propName)) {
            observedProps[propName] = true;
        }
    }

    function command(commandName: string, commandArgs?: any): boolean {
        switch (commandName) {
            case 'load': {
                command('unload');
                if (commandArgs && commandArgs.stream && typeof commandArgs.stream.playerFrameUrl === 'string') {
                    window.addEventListener('message', onMessage, false);
                    iframeElement.onload = function() {
                        sendMessage({
                            type: 'command',
                            commandName: commandName,
                            commandArgs: commandArgs
                        });
                    };
                    iframeElement.src = commandArgs.stream.playerFrameUrl;
                } else {
                    onError(Object.assign({}, ERROR.UNSUPPORTED_STREAM, {
                        critical: true,
                        stream: commandArgs ? commandArgs.stream : null
                    }));
                }
                return true;
            }
            case 'unload': {
                window.removeEventListener('message', onMessage);
                iframeElement.onload = null;
                iframeElement.removeAttribute('src');
                onPropChanged('stream', null);
                onPropChanged('loaded', null);
                onPropChanged('paused', null);
                onPropChanged('time', null);
                onPropChanged('duration', null);
                onPropChanged('buffering', null);
                onPropChanged('buffered', null);
                onPropChanged('volume', null);
                onPropChanged('muted', null);
                onPropChanged('playbackSpeed', null);
                return true;
            }
            case 'destroy': {
                command('unload');
                destroyed = true;
                events.removeAllListeners();
                containerElement.removeChild(iframeElement);
                return true;
            }
        }
        return false;
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
                    sendMessage(frozenAction);
                    return;
                }
                case 'setProp': {
                    sendMessage(frozenAction);
                    return;
                }
                case 'command': {
                    if (!command(frozenAction.commandName!, frozenAction.commandArgs)) {
                        sendMessage(frozenAction);
                    }
                    return;
                }
            }
        }

        throw new Error('Invalid action dispatched: ' + JSON.stringify(action));
    };
}

(IFrameVideo as any).canPlayStream = function(stream: any) {
    return Promise.resolve(stream && typeof stream.playerFrameUrl === 'string');
};

(IFrameVideo as any).manifest = {
    name: 'IFrameVideo',
    external: true,
    props: ['stream', 'loaded', 'paused', 'time', 'duration', 'buffering', 'buffered', 'audioTracks', 'selectedAudioTrackId', 'subtitlesTracks', 'selectedSubtitlesTrackId', 'subtitlesOffset', 'subtitlesSize', 'subtitlesTextColor', 'subtitlesBackgroundColor', 'subtitlesOutlineColor', 'volume', 'muted', 'playbackSpeed', 'extraSubtitlesTracks', 'selectedExtraSubtitlesTrackId', 'extraSubtitlesDelay', 'extraSubtitlesSize', 'extraSubtitlesOffset', 'extraSubtitlesTextColor', 'extraSubtitlesBackgroundColor', 'extraSubtitlesOutlineColor'],
    commands: ['load', 'unload', 'destroy', 'addExtraSubtitlesTracks'],
    events: ['propValue', 'propChanged', 'ended', 'error', 'subtitlesTrackLoaded', 'audioTrackLoaded', 'extraSubtitlesTrackLoaded', 'implementationChanged']
};

export default IFrameVideo;