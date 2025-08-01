// Local development server for API endpoints
// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 6969;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist'), {
    index: false // Don't automatically serve index.html for directories
}));

// History API fallback - immediately after static files
app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Skip requests for static files (have file extensions)
    if (req.path.includes('.') && !req.path.endsWith('/')) {
        return next();
    }
    
    // Serve React app for all other requests
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Real-Debrid API types and service (duplicated for local development)
class RealDebridService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.real-debrid.com/rest/1.0';
        this.maxRetries = 3;
        this.baseDelay = 1000; // 1 second
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async request(endpoint, options = {}, retryCount = 0) {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            console.log(`🌐 Real-Debrid API request: ${endpoint} (attempt ${retryCount + 1})`);
            
            const response = await fetch(url, {
                ...options,
                timeout: 15000, // 15 second timeout
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Real-Debrid API error: ${response.status} - ${error}`);
            }

            console.log(`✅ Real-Debrid API success: ${endpoint}`);
            return response;
            
        } catch (error) {
            console.error(`❌ Real-Debrid API error (attempt ${retryCount + 1}):`, error.message);
            
            // Check if it's a retryable error
            const isRetryable = error.code === 'ETIMEDOUT' || 
                               error.code === 'ECONNREFUSED' || 
                               error.code === 'ENOTFOUND' ||
                               error.name === 'FetchError' ||
                               (error.message && error.message.includes('fetch failed'));
            
            if (isRetryable && retryCount < this.maxRetries) {
                const delay = this.baseDelay * Math.pow(2, retryCount); // Exponential backoff
                console.log(`⏳ Retrying in ${delay}ms...`);
                await this.sleep(delay);
                return this.request(endpoint, options, retryCount + 1);
            }
            
            throw error;
        }
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
        const startTime = Date.now();
        try {
            console.log('🔄 Adding magnet to Real-Debrid...');
            console.log('📋 Magnet link length:', magnetLink.length, 'characters');
            
            // Add magnet to Real-Debrid
            const addResult = await this.addMagnet(magnetLink);
            const torrentId = addResult.id;
            
            console.log('📥 Torrent added with ID:', torrentId);
            console.log('⏱️  Add magnet completed in:', Date.now() - startTime, 'ms');

            // Wait for magnet to be processed with progressive timeout
            console.log('⏳ Waiting for torrent processing...');
            await this.sleep(2000);
            
            // Get torrent info with retry
            let attempts = 0;
            let torrentInfo;
            
            while (attempts < 5) {
                try {
                    torrentInfo = await this.getTorrentInfo(torrentId);
                    break;
                } catch (error) {
                    attempts++;
                    console.log(`⚠️  Failed to get torrent info (attempt ${attempts}/5):`, error.message);
                    if (attempts < 5) {
                        await this.sleep(1000 * attempts); // Progressive delay
                    }
                }
            }
            
            if (!torrentInfo) {
                throw new Error('Failed to retrieve torrent information after 5 attempts');
            }
            
            console.log('📊 Torrent status:', torrentInfo.status);
            console.log('📦 Torrent info:', {
                filename: torrentInfo.filename,
                filesize: torrentInfo.bytes ? `${(torrentInfo.bytes / 1024 / 1024 / 1024).toFixed(2)} GB` : 'Unknown',
                progress: torrentInfo.progress || 0
            });

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
            const totalTime = Date.now() - startTime;
            console.error('❌ Real-Debrid conversion failed:', error);
            console.error('⏱️  Total processing time:', totalTime, 'ms');
            console.error('🔍 Error details:', {
                name: error.name,
                code: error.code,
                cause: error.cause?.code
            });
            
            // Provide more specific error messages
            let userMessage = 'Unknown error occurred';
            if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
                userMessage = 'Request timed out. Real-Debrid service may be slow or unavailable.';
            } else if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
                userMessage = 'Cannot connect to Real-Debrid service. Check internet connection.';
            } else if (error.message.includes('API error')) {
                userMessage = error.message;
            } else if (error.message.includes('torrent information')) {
                userMessage = 'Failed to retrieve torrent status. The torrent may be invalid.';
            }
            
            return {
                streamUrl: '',
                filename: '',
                filesize: 0,
                status: 'error',
                message: userMessage,
                technicalError: error.message
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

// Subtitle proxy endpoint to handle CORS
app.get('/api/subtitles', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required'
            });
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                error: 'Invalid URL format'
            });
        }

        console.log('🔤 Fetching subtitles from:', url);

        // Fetch subtitle file with proper headers
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HighSeas/1.0',
                'Accept': 'text/plain, application/x-subrip, */*'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Failed to fetch subtitles',
                message: `External server returned ${response.status}`
            });
        }

        const contentType = response.headers.get('content-type') || 'text/plain';
        const subtitleContent = await response.text();

        // Set CORS headers and return subtitle content
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', contentType);
        
        res.send(subtitleContent);

    } catch (error) {
        console.error('❌ Subtitle proxy error:', error);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// File logging endpoint for development mode
app.post('/api/logs', async (req, res) => {
    try {
        const { logs } = req.body;
        
        if (!logs || !Array.isArray(logs)) {
            return res.status(400).json({
                error: 'Invalid logs format',
                message: 'Expected logs array in request body'
            });
        }

        // Create logs directory if it doesn't exist
        const logsDir = path.join(__dirname, '../logs');
        try {
            await fs.access(logsDir);
        } catch {
            await fs.mkdir(logsDir, { recursive: true });
        }

        // Generate log filename with date
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `app-${date}.log`);

        // Format logs for file output
        const logLines = logs.map(log => {
            const levelStr = ['ERROR', 'WARN', 'INFO', 'DEBUG'][log.level] || 'UNKNOWN';
            let line = `[${log.timestamp}] ${levelStr.padEnd(5)} ${log.category.padEnd(11)} ${log.message}`;
            
            if (log.data !== undefined) {
                if (typeof log.data === 'object') {
                    line += ` ${JSON.stringify(log.data)}`;
                } else {
                    line += ` ${log.data}`;
                }
            }
            
            if (log.stack) {
                line += `\n${log.stack}`;
            }
            
            return line;
        });

        // Append to log file
        const logContent = logLines.join('\n') + '\n';
        await fs.appendFile(logFile, logContent, 'utf8');

        res.json({ 
            status: 'ok', 
            message: `Logged ${logs.length} entries to ${path.basename(logFile)}`
        });

    } catch (error) {
        console.error('Failed to write logs to file:', error);
        res.status(500).json({
            error: 'Failed to write logs',
            message: error.message
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