/**
 * Subtitle parser using VTT.js
 * Based on stremio-video-reference/src/withHTMLSubtitles/subtitlesParser.js
 */

import * as VTTJS from 'vtt.js';
import binarySearchUpperBound from './binarySearchUpperBound';

const CRITICAL_ERROR_CODE = 0;

interface SubtitleCue {
    startTime: number;
    endTime: number;
    text: string;
}

interface CuesByTime {
    times: number[];
    [key: number]: SubtitleCue[];
}

function parse(text: string): Promise<CuesByTime> {
    return new Promise((resolve, reject) => {
        const parser = new (VTTJS as any).WebVTT.Parser(window, (VTTJS as any).WebVTT.StringDecoder());
        const errors: any[] = [];
        const cues: SubtitleCue[] = [];
        const cuesByTime: any = {};

        parser.oncue = function(c: any) {
            const cue: SubtitleCue = {
                startTime: (c.startTime * 1000) | 0,
                endTime: (c.endTime * 1000) | 0,
                text: c.text
            };
            cues.push(cue);
            cuesByTime[cue.startTime] = cuesByTime[cue.startTime] || [];
            cuesByTime[cue.endTime] = cuesByTime[cue.endTime] || [];
        };

        parser.onparsingerror = function(error: any) {
            if (error.code === CRITICAL_ERROR_CODE) {
                parser.oncue = null;
                parser.onparsingerror = null;
                parser.onflush = null;
                reject(error);
            } else {
                console.warn('Subtitles parsing error', error);
                errors.push(error);
            }
        };

        parser.onflush = function() {
            cuesByTime.times = Object.keys(cuesByTime)
                .map((time) => parseInt(time, 10))
                .sort((t1, t2) => t1 - t2);
                
            for (let i = 0; i < cues.length; i++) {
                cuesByTime[cues[i].startTime].push(cues[i]);
                const startTimeIndex = binarySearchUpperBound(cuesByTime.times, cues[i].startTime);
                for (let j = startTimeIndex + 1; j < cuesByTime.times.length; j++) {
                    if (cues[i].endTime <= cuesByTime.times[j]) {
                        break;
                    }
                    cuesByTime[cuesByTime.times[j]].push(cues[i]);
                }
            }

            for (let k = 0; k < cuesByTime.times.length; k++) {
                cuesByTime[cuesByTime.times[k]].sort((c1: SubtitleCue, c2: SubtitleCue) => {
                    return c1.startTime - c2.startTime || c1.endTime - c2.endTime;
                });
            }

            parser.oncue = null;
            parser.onparsingerror = null;
            parser.onflush = null;
            
            // we may have multiple parsing errors here, but will only respond with the first
            // if subtitle cues are available, we will not reject the promise
            if (cues.length === 0 && errors.length) {
                reject(errors[0]);
            } else if (cuesByTime.times.length === 0) {
                reject(new Error('Missing subtitle track cues'));
            } else {
                resolve(cuesByTime as CuesByTime);
            }
        };

        parser.parse(text);
    });
}

export default {
    parse
};