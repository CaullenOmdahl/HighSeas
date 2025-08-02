/**
 * Tracks data fetching
 * Based on stremio-video-reference/src/tracksData.js
 */

interface Track {
    type: 'audio' | 'text';
    [key: string]: any;
}

interface TracksResult {
    audio: Track[];
    subs: Track[];
}

function tracksData(url: string, cb: (result: TracksResult | false) => void): void {
    fetch('http://127.0.0.1:11470/tracks/' + encodeURIComponent(url))
        .then((resp) => resp.json())
        .then((tracks: Track[]) => {
            const audioTracks = tracks.filter((el) => (el || {}).type === 'audio');
            const subsTracks = tracks.filter((el) => (el || {}).type === 'text');
            cb({ audio: audioTracks, subs: subsTracks });
        })
        .catch((err) => {
            console.error(err);
            cb(false);
        });
}

export default tracksData;