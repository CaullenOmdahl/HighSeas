/**
 * Video parameters fetching for streaming server
 * Based on stremio-video-reference/src/withStreamingServer/fetchVideoParams.js
 */

import { URL, URLSearchParams } from 'url';

interface VideoParams {
    hash: string | null;
    size: number | null;
    filename: string | null;
}

interface OpensubtitlesParams {
    hash: string | null;
    size: number | null;
}

interface BehaviorHints {
    videoHash?: string;
    videoSize?: number;
    filename?: string;
}

function fetchOpensubtitlesParams(
    streamingServerURL: string, 
    mediaURL: string, 
    behaviorHints?: BehaviorHints
): Promise<OpensubtitlesParams> {
    const hash = behaviorHints?.videoHash || null;
    const size = behaviorHints && isFinite(behaviorHints.videoSize || 0) ? behaviorHints.videoSize : null;
    
    if (typeof hash === 'string' && size !== null && isFinite(size)) {
        return Promise.resolve({ hash, size });
    }

    const queryParams = new URLSearchParams([['videoUrl', mediaURL]]);
    const baseURL = new URL(streamingServerURL);
    const requestURL = `${baseURL.origin}/opensubHash?${queryParams.toString()}`;
    
    return fetch(requestURL)
        .then((resp) => {
            if (resp.ok) {
                return resp.json();
            }
            throw new Error(`${resp.status} (${resp.statusText})`);
        })
        .then((resp) => {
            if (resp.error) {
                throw new Error(resp.error);
            }

            return {
                hash: typeof hash === 'string' 
                    ? hash 
                    : resp.result?.hash || null,
                size: size !== null && isFinite(size) 
                    ? size 
                    : resp.result?.size || null
            };
        });
}

function fetchFilename(
    streamingServerURL: string, 
    mediaURL: string, 
    infoHash?: string, 
    fileIdx?: number, 
    behaviorHints?: BehaviorHints
): Promise<string> {
    if (behaviorHints?.filename) {
        return Promise.resolve(behaviorHints.filename);
    }

    if (infoHash && fileIdx !== undefined) {
        const baseURL = new URL(streamingServerURL);
        const requestURL = `${baseURL.origin}/${encodeURIComponent(infoHash)}/${encodeURIComponent(fileIdx)}/stats.json`;
        
        return fetch(requestURL)
            .then((resp) => {
                if (resp.ok) {
                    return resp.json();
                }
                throw new Error(`${resp.status} (${resp.statusText})`);
            })
            .then((resp) => {
                if (!resp || typeof resp.streamName !== 'string') {
                    throw new Error('Could not retrieve filename from torrent');
                }
                return resp.streamName;
            });
    }

    return Promise.resolve(decodeURIComponent(mediaURL.split('/').pop() || 'unknown'));
}

function fetchVideoParams(
    streamingServerURL: string,
    mediaURL: string,
    infoHash?: string,
    fileIdx?: number,
    behaviorHints?: BehaviorHints
): Promise<VideoParams> {
    return Promise.allSettled([
        fetchOpensubtitlesParams(streamingServerURL, mediaURL, behaviorHints),
        fetchFilename(streamingServerURL, mediaURL, infoHash, fileIdx, behaviorHints)
    ]).then((results) => {
        const result: VideoParams = { hash: null, size: null, filename: null };

        if (results[0].status === 'fulfilled') {
            const params = results[0].value as OpensubtitlesParams;
            result.hash = params.hash;
            result.size = params.size;
        } else if (results[0].reason) {
            console.error(results[0].reason);
        }

        if (results[1].status === 'fulfilled') {
            result.filename = results[1].value as string;
        } else if (results[1].reason) {
            console.error(results[1].reason);
        }

        return result;
    });
}

export default fetchVideoParams;