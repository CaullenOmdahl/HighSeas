/**
 * Player load status checker
 * Based on stremio-video-reference/src/withStreamingServer/isPlayerLoaded.js
 */

interface VideoInstance {
    on: (eventName: string, listener: (...args: any[]) => void) => void;
    dispatch: (action: any) => void;
}

function isPlayerLoaded(video: VideoInstance, props: string[]): Promise<boolean> {
    if (!props.includes('loaded')) {
        return Promise.resolve(true);
    }
    
    return new Promise((resolve, reject) => {
        let isLoaded: boolean | null = null;
        
        video.on('propChanged', (propName: string, propValue: any) => {
            if (propName === 'loaded' && propValue !== null && isLoaded === null) {
                isLoaded = propValue;
                if (propValue === true) {
                    resolve(true);
                } else if (propValue === false) {
                    reject(new Error('Player failed to load, will not retrieve video params'));
                }
            }
        });
        
        video.dispatch({
            type: 'observeProp',
            propName: 'loaded'
        });
    });
}

export default isPlayerLoaded;