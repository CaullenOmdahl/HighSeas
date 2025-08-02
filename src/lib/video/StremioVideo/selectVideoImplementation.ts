/**
 * Video implementation selection logic
 * Based on stremio-video-reference/src/StremioVideo/selectVideoImplementation.js
 */

import HTMLVideo from '../HTMLVideo/HTMLVideo';
import withStreamingServer from '../withStreamingServer/withStreamingServer';
import withHTMLSubtitles from '../withHTMLSubtitles/withHTMLSubtitles';
import withVideoParams from '../withVideoParams/withVideoParams';

interface CommandArgs {
    stream?: {
        externalUrl?: string;
        ytId?: string;
        playerFrameUrl?: string;
        url?: string;
    };
    platform?: string;
    streamingServerURL?: string;
}

interface Options {
    chromecastTransport?: any;
    shellTransport?: any;
}

function selectVideoImplementation(commandArgs: CommandArgs, options: Options = {}): any {
    if (!commandArgs.stream || typeof commandArgs.stream.externalUrl === 'string') {
        return null;
    }

    // Note: Chromecast support would go here but not implemented for web
    // if (options.chromecastTransport && options.chromecastTransport.getCastState() === cast.framework.CastState.CONNECTED) {
    //     return ChromecastSenderVideo;
    // }

    if (typeof commandArgs.stream.ytId === 'string') {
        // YouTube video support - not implemented for web but structure preserved
        // return withVideoParams(withHTMLSubtitles(YouTubeVideo));
        return null;
    }

    if (typeof commandArgs.stream.playerFrameUrl === 'string') {
        // IFrame video support - not implemented for web but structure preserved  
        // return withVideoParams(IFrameVideo);
        return null;
    }

    if (options.shellTransport) {
        // Shell transport support - not implemented for web but structure preserved
        // return withStreamingServer(withHTMLSubtitles(ShellVideo));
        return null;
    }

    if (typeof commandArgs.streamingServerURL === 'string') {
        if (commandArgs.platform === 'Tizen') {
            // return withStreamingServer(withHTMLSubtitles(TizenVideo));
            return null;
        }
        if (commandArgs.platform === 'webOS') {
            // return withStreamingServer(withHTMLSubtitles(WebOsVideo));
            return null;
        }
        if (commandArgs.platform === 'Titan' || commandArgs.platform === 'NetTV') {
            // return withStreamingServer(withHTMLSubtitles(TitanVideo));
            return null;
        }
        if (commandArgs.platform === 'Vidaa') {
            // return withStreamingServer(withHTMLSubtitles(VidaaVideo));
            return null;
        }
        return withStreamingServer(withHTMLSubtitles(HTMLVideo));
    }

    if (typeof commandArgs.stream.url === 'string') {
        if (commandArgs.platform === 'Tizen') {
            // return withVideoParams(withHTMLSubtitles(TizenVideo));
            return null;
        }
        if (commandArgs.platform === 'webOS') {
            // return withVideoParams(withHTMLSubtitles(WebOsVideo));
            return null;
        }
        if (commandArgs.platform === 'Titan' || commandArgs.platform === 'NetTV') {
            // return withVideoParams(withHTMLSubtitles(TitanVideo));
            return null;
        }
        if (commandArgs.platform === 'Vidaa') {
            // return withVideoParams(withHTMLSubtitles(VidaaVideo));
            return null;
        }
        return withVideoParams(withHTMLSubtitles(HTMLVideo));
    }

    return null;
}

export default selectVideoImplementation;