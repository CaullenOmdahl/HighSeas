/**
 * Shell Video Implementation
 * Based on stremio-video-reference/src/ShellVideo/ShellVideo.js
 * 
 * NOTE: This is a placeholder implementation maintaining API compatibility
 * Full implementation requires shell/native integration which is platform-specific
 */

import EventEmitter from 'eventemitter3';
import cloneDeep from 'lodash.clonedeep';
import deepFreeze from 'deep-freeze';
import { ERROR } from '../error';

interface ShellVideoOptions {
    containerElement: HTMLElement;
    shellTransport: any;
}

function ShellVideo(options: ShellVideoOptions) {
    const events = new EventEmitter();
    let destroyed = false;
    
    // Placeholder implementation - throws error indicating incomplete implementation
    function throwNotImplemented() {
        throw new Error('ShellVideo implementation requires platform-specific shell transport integration');
    }

    this.on = function(eventName: string, listener: (...args: any[]) => void) {
        if (destroyed) {
            throw new Error('Video is destroyed');
        }
        events.on(eventName, listener);
    };

    this.dispatch = function(action: any) {
        if (destroyed) {
            throw new Error('Video is destroyed');
        }

        if (action && action.type === 'command' && action.commandName === 'destroy') {
            destroyed = true;
            events.removeAllListeners();
            return;
        }

        // For non-destroy commands, indicate implementation is needed
        throwNotImplemented();
    };
}

(ShellVideo as any).canPlayStream = function(stream: any) {
    return Promise.resolve(false); // Not implemented for web platform
};

(ShellVideo as any).manifest = {
    name: 'ShellVideo',
    external: false,
    props: ['stream', 'loaded', 'paused', 'time', 'duration', 'buffering', 'buffered', 'audioTracks', 'selectedAudioTrackId', 'subtitlesTracks', 'selectedSubtitlesTrackId', 'subtitlesOffset', 'subtitlesSize', 'subtitlesDelay', 'subtitlesTextColor', 'subtitlesBackgroundColor', 'subtitlesOutlineColor', 'volume', 'muted', 'playbackSpeed'],
    commands: ['load', 'unload', 'destroy'],
    events: ['propValue', 'propChanged', 'ended', 'error', 'subtitlesTrackLoaded', 'audioTrackLoaded']
};

export default ShellVideo;