/**
 * Subtitle renderer using VTT.js
 * Based on stremio-video-reference/src/withHTMLSubtitles/subtitlesRenderer.js
 */

import * as VTTJS from 'vtt.js';
import binarySearchUpperBound from './binarySearchUpperBound';

interface SubtitleCue {
    startTime: number;
    endTime: number;
    text: string;
}

interface CuesByTime {
    times: number[];
    [key: number]: SubtitleCue[];
}

function render(cuesByTime: CuesByTime, time: number): Node[] {
    const nodes: Node[] = [];
    const timeIndex = binarySearchUpperBound(cuesByTime.times, time);
    
    if (timeIndex !== -1) {
        const cuesForTime = cuesByTime[cuesByTime.times[timeIndex]];
        for (let i = 0; i < cuesForTime.length; i++) {
            const node = (VTTJS as any).WebVTT.convertCueToDOMTree(window, cuesForTime[i].text);
            nodes.push(node);
        }
    }

    return nodes;
}

export default {
    render
};