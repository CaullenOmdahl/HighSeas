/**
 * Type declarations for vtt.js
 */

declare module 'vtt.js' {
    export namespace WebVTT {
        class Parser {
            constructor(window: Window, stringDecoder: any);
            oncue: ((cue: any) => void) | null;
            onparsingerror: ((error: any) => void) | null;
            onflush: (() => void) | null;
            parse(text: string): void;
        }

        function StringDecoder(): any;
        function convertCueToDOMTree(window: Window, text: string): Node;
    }
}