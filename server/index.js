// Local development server for API endpoints
// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

// Middleware
app.use(cors());
app.use(express.json());

// Real-Debrid API types and service (duplicated for local development)
class RealDebridService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.real-debrid.com/rest/1.0';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Real-Debrid API error: ${response.status} - ${error}`);
        }

        return response;
    }

    async addMagnet(magnetLink) {
        const formData = new FormData();
        formData.append('magnet', magnetLink);

        const response = await this.request('/torrents/addMagnet', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });

        return response.json();
    }

    async getTorrentInfo(id) {
        const response = await this.request(`/torrents/info/${id}`);
        return response.json();
    }

    async selectFiles(id, fileIds = 'all') {
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

    async getDownloadLink(link) {
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

    async convertMagnetToStream(magnetLink) {
        try {
            console.log('🔄 Adding magnet to Real-Debrid...');
            
            // Add magnet to Real-Debrid
            const addResult = await this.addMagnet(magnetLink);
            const torrentId = addResult.id;
            
            console.log('📥 Torrent added with ID:', torrentId);

            // Wait for magnet to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Get torrent info
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
                // Select the largest video file
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

                const largestFile = videoFiles.reduce((prev, current) => 
                    (prev.bytes > current.bytes) ? prev : current
                );

                console.log('🎥 Selecting video file:', largestFile.path);
                await this.selectFiles(torrentId, largestFile.id.toString());

                // Wait for file selection to process
                await new Promise(resolve => setTimeout(resolve, 1500));
                
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

                // Get direct download link
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
}

// Real-Debrid API endpoint
app.post('/api/realdebrid', async (req, res) => {
    try {
        const REAL_DEBRID_TOKEN = process.env.REAL_DEBRID_TOKEN;
        
        if (!REAL_DEBRID_TOKEN) {
            return res.status(500).json({
                error: 'Real-Debrid service not configured',
                message: 'REAL_DEBRID_TOKEN environment variable not set'
            });
        }

        const realDebridService = new RealDebridService(REAL_DEBRID_TOKEN);
        const { magnetLink } = req.body;
        
        if (!magnetLink) {
            return res.status(400).json({
                error: 'Magnet link is required',
                message: 'Please provide a magnetLink in the request body'
            });
        }

        if (!magnetLink.startsWith('magnet:')) {
            return res.status(400).json({
                error: 'Invalid magnet link format',
                message: 'URL must start with magnet:'
            });
        }

        console.log('🔄 Processing magnet link conversion...');
        
        const result = await realDebridService.convertMagnetToStream(magnetLink);
        
        return res.status(200).json(result);

    } catch (error) {
        console.error('❌ Real-Debrid API error:', error);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Health check for Real-Debrid API
app.get('/api/realdebrid', async (req, res) => {
    try {
        const REAL_DEBRID_TOKEN = process.env.REAL_DEBRID_TOKEN;
        
        if (!REAL_DEBRID_TOKEN) {
            return res.status(500).json({
                status: 'error',
                message: 'REAL_DEBRID_TOKEN environment variable not set'
            });
        }

        const response = await fetch('https://api.real-debrid.com/rest/1.0/user', {
            headers: {
                'Authorization': `Bearer ${REAL_DEBRID_TOKEN}`
            }
        });

        if (response.ok) {
            const userInfo = await response.json();
            return res.status(200).json({
                status: 'connected',
                user: {
                    username: userInfo.username,
                    email: userInfo.email,
                    premium: userInfo.premium,
                    expiration: userInfo.expiration
                }
            });
        } else {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to connect to Real-Debrid API'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Connection failed'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'HighSeas Development Server'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 HighSeas development server running on http://localhost:${PORT}`);
    console.log(`🔗 Real-Debrid API available at http://localhost:${PORT}/api/realdebrid`);
    
    if (!process.env.REAL_DEBRID_TOKEN) {
        console.warn('⚠️  Warning: REAL_DEBRID_TOKEN not set in environment variables');
        console.warn('   Real-Debrid integration will not work without this token');
    } else {
        console.log('✅ Real-Debrid token found in environment');
    }
});