/**
 * Torrent creation for streaming server
 * Based on stremio-video-reference/src/withStreamingServer/createTorrent.js
 */

interface TorrentInfo {
    url: string;
    infoHash: string;
    fileIdx: number | null;
    sources: string[];
}

interface SeriesInfo {
    season: number | null;
    episode: number | null;
}

interface TorrentBody {
    torrent: {
        infoHash: string;
    };
    peerSearch?: {
        sources: string[];
        min: number;
        max: number;
    };
    guessFileIdx: boolean | { season?: number; episode?: number };
}

function buildTorrent(streamingServerURL: string, infoHash: string, fileIdx: number | null, sources: string[]): TorrentInfo {
    const query = Array.isArray(sources) && sources.length > 0 
        ? '?' + new URLSearchParams(sources.map(source => ['tr', source]))
        : '';
    
    const baseUrl = new URL(streamingServerURL);
    const url = `${baseUrl.origin}/${encodeURIComponent(infoHash)}/${encodeURIComponent(String(fileIdx))}${query}`;
    
    return {
        url,
        infoHash,
        fileIdx,
        sources
    };
}

function createTorrent(
    streamingServerURL: string, 
    infoHash: string, 
    fileIdx: number | null, 
    sources: string[], 
    seriesInfo?: SeriesInfo
): Promise<TorrentInfo> {
    if ((!Array.isArray(sources) || sources.length === 0) && (fileIdx !== null && isFinite(fileIdx))) {
        return Promise.resolve(buildTorrent(streamingServerURL, infoHash, fileIdx, sources));
    }

    const body: TorrentBody = {
        torrent: {
            infoHash: infoHash,
        },
        guessFileIdx: false
    };

    if (Array.isArray(sources) && sources.length > 0) {
        body.peerSearch = {
            sources: ['dht:' + infoHash].concat(sources).filter((source, index, sources) => {
                return sources.indexOf(source) === index;
            }),
            min: 40,
            max: 200
        };
    }

    if (fileIdx === null || !isFinite(fileIdx)) {
        body.guessFileIdx = {};
        if (seriesInfo) {
            if (seriesInfo.season !== null && isFinite(seriesInfo.season)) {
                (body.guessFileIdx as any).season = seriesInfo.season;
            }
            if (seriesInfo.episode !== null && isFinite(seriesInfo.episode)) {
                (body.guessFileIdx as any).episode = seriesInfo.episode;
            }
        }
    } else {
        body.guessFileIdx = false;
    }

    const baseUrl = new URL(streamingServerURL);
    const requestUrl = `${baseUrl.origin}/${encodeURIComponent(infoHash)}/create`;

    return fetch(requestUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then((resp) => {
        if (resp.ok) {
            return resp.json();
        }
        throw new Error(resp.status + ' (' + resp.statusText + ')');
    }).then((resp) => {
        return buildTorrent(
            streamingServerURL, 
            infoHash, 
            body.guessFileIdx ? resp.guessedFileIdx : fileIdx, 
            body.peerSearch ? body.peerSearch.sources : []
        );
    });
}

export default createTorrent;