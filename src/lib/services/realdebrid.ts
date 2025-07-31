// Real-Debrid API service for converting magnet links to direct HTTP streams
// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

interface RealDebridTorrent {
    id: string;
    filename: string;
    original_filename: string;
    hash: string;
    bytes: number;
    original_bytes: number;
    host: string;
    split: number;
    progress: number;
    status: 'magnet_error' | 'magnet_conversion' | 'waiting_files_selection' | 'queued' | 'downloading' | 'downloaded' | 'error' | 'virus' | 'compressing' | 'uploading' | 'dead';
    added: string;
    files: Array<{
        id: number;
        path: string;
        bytes: number;
        selected: number;
    }>;
    links: string[];
    ended?: string;
    speed?: number;
    seeders?: number;
}

interface RealDebridLink {
    id: string;
    filename: string;
    mimeType: string;
    filesize: number;
    link: string;
    host: string;
    host_icon: string;
    chunks: number;
    crc: number;
    download: string;
    streamable: number;
}

class RealDebridService {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.real-debrid.com/rest/1.0';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Real-Debrid API error: ${response.status} - ${error}`);
        }

        return response;
    }

    // Add a magnet link to Real-Debrid
    async addMagnet(magnetLink: string): Promise<{ id: string; uri: string }> {
        const formData = new FormData();
        formData.append('magnet', magnetLink);

        const response = await this.request('/torrents/addMagnet', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                // Don't set Content-Type for FormData, let browser set it
            },
        });

        return response.json();
    }

    // Get torrent info and status
    async getTorrentInfo(id: string): Promise<RealDebridTorrent> {
        const response = await this.request(`/torrents/info/${id}`);
        return response.json();
    }

    // Select files to download from a torrent
    async selectFiles(id: string, fileIds: string = 'all'): Promise<void> {
        const formData = new FormData();
        formData.append('files', fileIds);

        await this.request(`/torrents/selectFiles/${id}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
    }

    // Get direct download link
    async getDownloadLink(link: string): Promise<RealDebridLink> {
        const formData = new FormData();
        formData.append('link', link);

        const response = await this.request('/unrestrict/link', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });

        return response.json();
    }

    // Convert magnet link to direct HTTP stream URL
    async convertMagnetToStream(magnetLink: string): Promise<{
        streamUrl: string;
        filename: string;
        filesize: number;
        status: 'ready' | 'processing' | 'error';
        message?: string;
    }> {
        try {
            console.log('🔄 Adding magnet to Real-Debrid:', magnetLink.substring(0, 50) + '...');
            
            // Step 1: Add magnet to Real-Debrid
            const addResult = await this.addMagnet(magnetLink);
            const torrentId = addResult.id;
            
            console.log('📥 Torrent added with ID:', torrentId);

            // Step 2: Wait a moment for magnet to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Step 3: Get torrent info
            const torrentInfo = await this.getTorrentInfo(torrentId);
            
            console.log('📊 Torrent status:', torrentInfo.status);

            if (torrentInfo.status === 'magnet_error') {
                return {
                    streamUrl: '',
                    filename: '',
                    filesize: 0,
                    status: 'error',
                    message: 'Invalid magnet link or torrent not found'
                };
            }

            if (torrentInfo.status === 'magnet_conversion') {
                return {
                    streamUrl: '',
                    filename: torrentInfo.filename || 'Processing...',
                    filesize: torrentInfo.bytes || 0,
                    status: 'processing',
                    message: 'Converting magnet link, please wait...'
                };
            }

            if (torrentInfo.status === 'waiting_files_selection') {
                // Step 4: Select the largest video file
                const videoFiles = torrentInfo.files.filter(file => 
                    /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v)$/i.test(file.path)
                );

                if (videoFiles.length === 0) {
                    return {
                        streamUrl: '',
                        filename: torrentInfo.filename || '',
                        filesize: 0,
                        status: 'error',
                        message: 'No video files found in torrent'
                    };
                }

                // Select the largest video file
                const largestFile = videoFiles.reduce((prev, current) => 
                    (prev.bytes > current.bytes) ? prev : current
                );

                console.log('🎥 Selecting video file:', largestFile.path);
                await this.selectFiles(torrentId, largestFile.id.toString());

                // Wait for file selection to process
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Get updated torrent info
                const updatedInfo = await this.getTorrentInfo(torrentId);
                
                if (updatedInfo.links.length === 0) {
                    return {
                        streamUrl: '',
                        filename: largestFile.path,
                        filesize: largestFile.bytes,
                        status: 'processing',
                        message: 'Preparing download link...'
                    };
                }

                // Step 5: Get direct download link
                const downloadLink = await this.getDownloadLink(updatedInfo.links[0]);
                
                console.log('✅ Stream ready:', downloadLink.filename);

                return {
                    streamUrl: downloadLink.download,
                    filename: downloadLink.filename,
                    filesize: downloadLink.filesize,
                    status: 'ready'
                };
            }

            if (torrentInfo.status === 'downloaded' && torrentInfo.links.length > 0) {
                // Direct link already available
                const downloadLink = await this.getDownloadLink(torrentInfo.links[0]);
                
                return {
                    streamUrl: downloadLink.download,
                    filename: downloadLink.filename,
                    filesize: downloadLink.filesize,
                    status: 'ready'
                };
            }

            return {
                streamUrl: '',
                filename: torrentInfo.filename || '',
                filesize: torrentInfo.bytes || 0,
                status: 'processing',
                message: `Torrent status: ${torrentInfo.status}`
            };

        } catch (error) {
            console.error('❌ Real-Debrid conversion failed:', error);
            return {
                streamUrl: '',
                filename: '',
                filesize: 0,
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Get user account info
    async getUserInfo(): Promise<any> {
        const response = await this.request('/user');
        return response.json();
    }
}

export default RealDebridService;