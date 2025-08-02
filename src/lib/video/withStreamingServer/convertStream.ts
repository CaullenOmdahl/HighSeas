/**
 * Stream conversion utilities for streaming server
 * Based on stremio-video-reference/src/withStreamingServer/convertStream.js
 */

import * as magnet from 'magnet-uri';
import createTorrent from './createTorrent';

interface ProxyHeaders {
    request?: Record<string, string>;
    response?: Record<string, string>;
}

interface BehaviorHints {
    proxyHeaders?: ProxyHeaders;
}

interface StreamInput {
    url?: string;
    infoHash?: string;
    fileIdx?: number;
    announce?: string[];
    behaviorHints?: BehaviorHints;
}

interface StreamOutput {
    url: string;
    infoHash?: string;
    fileIdx?: number | null;
}

interface SeriesInfo {
    season?: number | null;
    episode?: number | null;
}

interface StreamingServerSettings {
    proxyStreamsEnabled?: boolean;
}

function buildProxyUrl(
    streamingServerURL: string, 
    streamURL: string, 
    requestHeaders: Record<string, string>, 
    responseHeaders: Record<string, string>
): string {
    const parsedStreamURL = new URL(streamURL);
    const proxyOptions = new URLSearchParams();
    proxyOptions.set('d', parsedStreamURL.origin);
    
    Object.entries(requestHeaders).forEach(([key, value]) => {
        proxyOptions.append('h', key + ':' + value);
    });
    
    Object.entries(responseHeaders).forEach(([key, value]) => {
        proxyOptions.append('r', key + ':' + value);
    });
    
    const baseUrl = new URL(streamingServerURL);
    return `${baseUrl.origin}/proxy/${proxyOptions.toString()}${parsedStreamURL.pathname}${parsedStreamURL.search}`;
}

function convertStream(
    streamingServerURL: string, 
    stream: StreamInput, 
    seriesInfo?: SeriesInfo, 
    streamingServerSettings?: StreamingServerSettings
): Promise<StreamOutput> {
    return new Promise((resolve, reject) => {
        if (typeof stream.url === 'string') {
            if (stream.url.indexOf('magnet:') === 0) {
                let parsedMagnetURI: any;
                try {
                    parsedMagnetURI = magnet.decode(stream.url);
                    if (!parsedMagnetURI || typeof parsedMagnetURI.infoHash !== 'string') {
                        throw new Error('Failed to decode magnet url');
                    }
                } catch (error) {
                    reject(error);
                    return;
                }

                const sources = Array.isArray(parsedMagnetURI.announce) 
                    ? parsedMagnetURI.announce.map((source: string) => 'tracker:' + source)
                    : [];
                    
                createTorrent(streamingServerURL, parsedMagnetURI.infoHash, null, sources, seriesInfo)
                    .then((torrent) => {
                        resolve({ 
                            url: torrent.url, 
                            infoHash: torrent.infoHash, 
                            fileIdx: torrent.fileIdx 
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {
                const proxyStreamsEnabled = streamingServerSettings && streamingServerSettings.proxyStreamsEnabled;
                const proxyHeaders = stream.behaviorHints && stream.behaviorHints.proxyHeaders;
                
                if (proxyStreamsEnabled || proxyHeaders) {
                    const requestHeaders = proxyHeaders && proxyHeaders.request ? proxyHeaders.request : {};
                    const responseHeaders = proxyHeaders && proxyHeaders.response ? proxyHeaders.response : {};
                    resolve({ 
                        url: buildProxyUrl(streamingServerURL, stream.url, requestHeaders, responseHeaders) 
                    });
                } else {
                    resolve({ url: stream.url });
                }
            }
            return;
        }

        if (typeof stream.infoHash === 'string') {
            createTorrent(streamingServerURL, stream.infoHash, stream.fileIdx || null, stream.announce || [], seriesInfo)
                .then((torrent) => {
                    resolve({ 
                        url: torrent.url, 
                        infoHash: torrent.infoHash, 
                        fileIdx: torrent.fileIdx 
                    });
                })
                .catch((error) => {
                    reject(error);
                });
            return;
        }

        reject(new Error('Stream cannot be converted'));
    });
}

export default convertStream;