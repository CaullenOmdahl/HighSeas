/**
 * Binary search upper bound implementation
 * Based on stremio-video-reference/src/withHTMLSubtitles/binarySearchUpperBound.js
 */

function binarySearchUpperBound(array: number[], value: number): number {
    if (value < array[0] || array[array.length - 1] < value) {
        return -1;
    }

    let left = 0;
    let right = array.length - 1;
    let index = -1;
    
    while (left <= right) {
        const middle = Math.floor((left + right) / 2);
        if (array[middle] > value) {
            right = middle - 1;
        } else if (array[middle] < value) {
            left = middle + 1;
        } else {
            index = middle;
            left = middle + 1;
        }
    }

    return index !== -1 ? index : right;
}

export default binarySearchUpperBound;