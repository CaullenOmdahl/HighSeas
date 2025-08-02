/**
 * Chromecast Sender Video Implementation
 * Based on stremio-video-reference/src/ChromecastSenderVideo/ChromecastSenderVideo.js
 */

import EventEmitter from 'eventemitter3';
import { ERROR } from '../error';

interface ChromecastSenderVideoOptions {
    containerElement: HTMLElement;
    chromecastTransport: any;
}

interface VideoAction {
    type: 'observeProp' | 'setProp' | 'command';
    propName?: string;
    propValue?: any;
    commandName?: string;
    commandArgs?: any;
}

function ChromecastSenderVideo(options: ChromecastSenderVideoOptions) {
    const containerElement = options.containerElement;
    if (!(containerElement instanceof HTMLElement)) {
        throw new Error('Container element required to be instance of HTMLElement');
    }

    const chromecastTransport = options.chromecastTransport;
    if (!chromecastTransport) {
        throw new Error('Chromecast transport required');
    }

    const device = chromecastTransport.getCastDevice();
    if (device === null) {
        throw new Error('Chromecast session must be started');
    }

    const deviceNameContainerElement = document.createElement('div');
    deviceNameContainerElement.style.display = 'flex';
    deviceNameContainerElement.style.flexDirection = 'row';
    deviceNameContainerElement.style.alignItems = 'center';
    deviceNameContainerElement.style.justifyContent = 'center';
    deviceNameContainerElement.style.width = '100%';
    deviceNameContainerElement.style.height = '100%';
    deviceNameContainerElement.style.backgroundColor = 'black';
    
    const deviceNameLabelElement = document.createElement('div');
    deviceNameLabelElement.style.flex = 'none';
    deviceNameLabelElement.style.maxWidth = '80%';
    deviceNameLabelElement.style.fontSize = '5vmin';
    deviceNameLabelElement.style.lineHeight = '1.2em';
    deviceNameLabelElement.style.maxHeight = '3.6em';
    deviceNameLabelElement.style.textAlign = 'center';
    deviceNameLabelElement.style.color = '#FFFFFF90';
    deviceNameLabelElement.innerText = 'Casting to ' + device.friendlyName;
    
    deviceNameContainerElement.appendChild(deviceNameLabelElement);
    containerElement.appendChild(deviceNameContainerElement);
    chromecastTransport.on('message', onMessage);
    chromecastTransport.on('message-error', onMessageReceivedError);

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
        audioTracks: false,
        selectedAudioTrackId: false,
        subtitlesTracks: false,
        selectedSubtitlesTrackId: false,
        subtitlesOffset: false,
        subtitlesSize: false,
        subtitlesTextColor: false,
        subtitlesBackgroundColor: false,
        subtitlesOutlineColor: false,
        volume: false,
        muted: false,
        playbackSpeed: false,
        videoParams: false,
        extraSubtitlesTracks: false,
        selectedExtraSubtitlesTrackId: false,
        extraSubtitlesDelay: false,
        extraSubtitlesSize: false,
        extraSubtitlesOffset: false,
        extraSubtitlesTextColor: false,
        extraSubtitlesBackgroundColor: false,
        extraSubtitlesOutlineColor: false
    };

    function onMessageSendError(error: any, action: VideoAction) {
        events.emit('error', Object.assign({}, ERROR.CHROMECAST_SENDER_VIDEO.MESSAGE_SEND_FAILED, {
            error: error,
            action: action
        }));
    }

    function onMessageReceivedError(error: any) {
        events.emit('error', Object.assign({}, ERROR.CHROMECAST_SENDER_VIDEO.INVALID_MESSAGE_RECEIVED, {
            error: error
        }));
    }

    function onMessage(message: any) {
        if (!message || typeof message.event !== 'string') {
            onMessageReceivedError(new Error('Invalid message: ' + message));
            return;
        }

        const args = Array.isArray(message.args) ? message.args : [];
        events.emit(message.event, ...args);
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

    function command(commandName: string, commandArgs?: any) {
        switch (commandName) {
            case 'destroy': {
                destroyed = true;
                onPropChanged('stream', null);
                onPropChanged('loaded', null);
                onPropChanged('paused', null);
                onPropChanged('time', null);
                onPropChanged('duration', null);
                onPropChanged('buffering', null);
                onPropChanged('buffered', null);
                onPropChanged('audioTracks', []);
                onPropChanged('selectedAudioTrackId', []);
                onPropChanged('subtitlesTracks', []);
                onPropChanged('selectedSubtitlesTrackId', null);
                onPropChanged('subtitlesOffset', null);
                onPropChanged('subtitlesSize', null);
                onPropChanged('subtitlesTextColor', null);
                onPropChanged('subtitlesBackgroundColor', null);
                onPropChanged('subtitlesOutlineColor', null);
                onPropChanged('volume', null);
                onPropChanged('muted', null);
                onPropChanged('playbackSpeed', null);
                onPropChanged('videoParams', null);
                onPropChanged('extraSubtitlesTracks', []);
                onPropChanged('selectedExtraSubtitlesTrackId', null);
                onPropChanged('extraSubtitlesDelay', null);
                onPropChanged('extraSubtitlesSize', null);
                onPropChanged('extraSubtitlesOffset', null);
                onPropChanged('extraSubtitlesTextColor', null);
                onPropChanged('extraSubtitlesBackgroundColor', null);
                onPropChanged('extraSubtitlesOutlineColor', null);
                events.removeAllListeners();
                chromecastTransport.off('message', onMessage);
                containerElement.removeChild(deviceNameContainerElement);
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
            switch (action.type) {
                case 'observeProp': {
                    observeProp(action.propName!);
                    chromecastTransport.sendMessage(action).catch((error: any) => {
                        onMessageSendError(error, action);
                    });
                    return;
                }
                case 'setProp': {
                    chromecastTransport.sendMessage(action).catch((error: any) => {
                        onMessageSendError(error, action);
                    });
                    return;
                }
                case 'command': {
                    command(action.commandName!, action.commandArgs);
                    chromecastTransport.sendMessage(action).catch((error: any) => {
                        onMessageSendError(error, action);
                    });
                    return;
                }
            }
        }

        throw new Error('Invalid action dispatched: ' + JSON.stringify(action));
    };
}

(ChromecastSenderVideo as any).canPlayStream = function() {
    return Promise.resolve(true);
};

(ChromecastSenderVideo as any).manifest = {
    name: 'ChromecastSenderVideo',
    external: true,
    props: ['stream', 'loaded', 'paused', 'time', 'duration', 'buffering', 'buffered', 'audioTracks', 'selectedAudioTrackId', 'subtitlesTracks', 'selectedSubtitlesTrackId', 'subtitlesOffset', 'subtitlesSize', 'subtitlesTextColor', 'subtitlesBackgroundColor', 'subtitlesOutlineColor', 'volume', 'muted', 'playbackSpeed', 'videoParams', 'extraSubtitlesTracks', 'selectedExtraSubtitlesTrackId', 'extraSubtitlesDelay', 'extraSubtitlesSize', 'extraSubtitlesOffset', 'extraSubtitlesTextColor', 'extraSubtitlesBackgroundColor', 'extraSubtitlesOutlineColor'],
    commands: ['load', 'unload', 'destroy', 'addExtraSubtitlesTracks'],
    events: ['propValue', 'propChanged', 'ended', 'error', 'subtitlesTrackLoaded', 'audioTrackLoaded', 'extraSubtitlesTrackLoaded', 'implementationChanged']
};

export default ChromecastSenderVideo;