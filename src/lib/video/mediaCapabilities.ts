/**
 * Media capabilities detection for Stremio video system
 * Based on stremio-video-reference/src/mediaCapabilities.js
 */

interface CodecConfig {
    codec: string;
    force?: boolean;
    mime: string;
    aliases?: string[];
}

const VIDEO_CODEC_CONFIGS: CodecConfig[] = [
    {
        codec: 'h264',
        force: !!(window as any).chrome || !!(window as any).cast,
        mime: 'video/mp4; codecs="avc1.42E01E"',
    },
    {
        codec: 'h265',
        // Disabled because chrome only has partial support for h265/hevc,
        // force: window.chrome || window.cast,
        mime: 'video/mp4; codecs="hev1.1.6.L150.B0"',
        aliases: ['hevc']
    },
    {
        codec: 'vp8',
        mime: 'video/mp4; codecs="vp8"'
    },
    {
        codec: 'vp9',
        mime: 'video/mp4; codecs="vp9"'
    }
];

const AUDIO_CODEC_CONFIGS: CodecConfig[] = [
    {
        codec: 'aac',
        mime: 'audio/mp4; codecs="mp4a.40.2"'
    },
    {
        codec: 'mp3',
        mime: 'audio/mp4; codecs="mp3"'
    },
    {
        codec: 'ac3',
        mime: 'audio/mp4; codecs="ac-3"'
    },
    {
        codec: 'eac3',
        mime: 'audio/mp4; codecs="ec-3"'
    },
    {
        codec: 'vorbis',
        mime: 'audio/mp4; codecs="vorbis"'
    },
    {
        codec: 'opus',
        mime: 'audio/mp4; codecs="opus"'
    }
];

function canPlay(config: CodecConfig, options: { mediaElement: HTMLVideoElement }): string[] {
    return config.force || options.mediaElement.canPlayType(config.mime)
        ? [config.codec].concat(config.aliases || [])
        : [];
}

function getMaxAudioChannels(): number {
    if (/firefox/i.test(window.navigator.userAgent)) {
        return 6;
    }

    if (!(window as any).AudioContext || !!(window as any).chrome || !!(window as any).cast) {
        return 2;
    }

    const audioContext = new (window as any).AudioContext();
    const maxChannelCount = audioContext.destination.maxChannelCount;
    audioContext.close(); // Clean up
    return maxChannelCount > 0 ? maxChannelCount : 2;
}

function getMediaCapabilities() {
    const mediaElement = document.createElement('video');
    let formats = ['mp4'];
    if (!!(window as any).chrome || !!(window as any).cast) {
        formats.push('matroska,webm');
    }
    
    const videoCodecs = VIDEO_CODEC_CONFIGS
        .map((config) => canPlay(config, { mediaElement }))
        .reduce((result, value) => result.concat(value), []);
        
    const audioCodecs = AUDIO_CODEC_CONFIGS
        .map((config) => canPlay(config, { mediaElement }))
        .reduce((result, value) => result.concat(value), []);
        
    const maxAudioChannels = getMaxAudioChannels();
    
    return {
        formats,
        videoCodecs,
        audioCodecs,
        maxAudioChannels
    };
}

export default getMediaCapabilities();