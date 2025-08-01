// Local development server for API endpoints
// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
// import { pipeline } from 'stream/promises'; // Currently unused
import { Readable } from 'stream';
import { spawn } from 'child_process';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 6969;

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT) || 100; // 100 requests per window

// Rate limiting middleware
const rateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    // Clean old entries
    if (rateLimitStore.size > 10000) { // Prevent memory bloat
        for (const [ip, timestamps] of rateLimitStore.entries()) {
            const validTimestamps = timestamps.filter(time => time > windowStart);
            if (validTimestamps.length === 0) {
                rateLimitStore.delete(ip);
            } else {
                rateLimitStore.set(ip, validTimestamps);
            }
        }
    }
    
    // Get or create timestamp array for this IP
    let timestamps = rateLimitStore.get(clientIP) || [];
    
    // Remove timestamps outside the window
    timestamps = timestamps.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (timestamps.length >= RATE_LIMIT_MAX) {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW / 60000} minutes.`,
            retryAfter: Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW - now) / 1000)
        });
    }
    
    // Add current timestamp
    timestamps.push(now);
    rateLimitStore.set(clientIP, timestamps);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - timestamps.length));
    res.setHeader('X-RateLimit-Reset', Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW) / 1000));
    
    next();
};

// CORS Configuration - Restrict to specific origins
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) :
    [
      'http://localhost:5173',   // Vite dev server
      'http://localhost:6969',   // Production server
      'http://localhost:4173'    // Vite preview
    ],
  credentials: false,
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.BODY_SIZE_LIMIT || '10mb' }));

// Apply rate limiting to API routes only
app.use('/api/', rateLimit);

// Security headers middleware
app.use((req, res, next) => {
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    // Content Security Policy - Allow streaming from trusted domains
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "media-src 'self' *.real-debrid.com https:; " +
        "connect-src 'self' *.real-debrid.com https:; " +
        "font-src 'self' data:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self';"
    );
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature Policy)
    res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
    
    next();
});

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

// Video proxy endpoint for Real-Debrid streams (GET and HEAD)
app.all('/api/proxy', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required'
            });
        }

        // Use centralized URL validation for security
        if (!validateMediaURL(url)) {
            return res.status(403).json({
                error: 'Invalid or untrusted URL',
                message: 'URL must be from a trusted streaming domain'
            });
        }

        // Handle range requests for video seeking
        const range = req.headers.range;
        
        console.log('🎥 Proxying video stream from:', sanitizeURLForLogging(url).substring(0, 100) + '...', `(${req.method})`);
        if (range) {
            console.log('🎯 Range request:', range);
        }

        // Handle HEAD requests differently (for video element probing)
        if (req.method === 'HEAD') {
            console.log('🔍 HEAD request - returning basic headers');
            let contentType = 'video/mp4';
            if (url.includes('.mkv')) {
                contentType = 'video/x-matroska';
            } else if (url.includes('.mp4')) {
                contentType = 'video/mp4';
            }
            
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length');
            return res.status(200).end();
        }
        
        const headers = {
            'User-Agent': 'Stremio/4.4.0 (HighSeas)',  // Mimic Stremio user agent
            'Accept': 'video/*, */*',
            'Accept-Encoding': 'identity', // Prevent compression for video
            'Connection': 'keep-alive',    // Keep connection alive
            'Cache-Control': 'no-cache',   // Don't cache video data
        };

        if (range) {
            headers.Range = range;
            console.log('🎯 Processing range request:', range);
        }

        // Copy additional headers from client (but filter sensitive ones)
        const allowedHeaders = ['accept-language', 'referer'];
        allowedHeaders.forEach(headerName => {
            if (req.headers[headerName]) {
                headers[headerName] = req.headers[headerName];
            }
        });

        // Fetch video stream with Stremio-like configuration
        const response = await fetch(url, {
            headers,
            method: 'GET',
            // Don't set timeout - let it stream continuously
        });

        if (!response.ok) {
            console.error('❌ Failed to fetch from Real-Debrid:', response.status, response.statusText);
            return res.status(response.status).json({
                error: 'Failed to fetch video stream',
                message: `External server returned ${response.status}: ${response.statusText}`
            });
        }

        console.log('✅ Successfully connected to Real-Debrid stream');
        console.log('📋 Response info:', {
            status: response.status,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            acceptRanges: response.headers.get('accept-ranges')
        });

        // Copy response headers - detect proper content type
        let contentType = response.headers.get('content-type');
        
        // Real-Debrid often returns 'application/force-download' - fix this
        if (!contentType || contentType === 'application/force-download' || contentType === 'application/octet-stream') {
            // Detect content type from file extension
            if (url.includes('.mkv')) {
                contentType = 'video/x-matroska';
            } else if (url.includes('.mp4')) {
                contentType = 'video/mp4';
            } else if (url.includes('.avi')) {
                contentType = 'video/x-msvideo';
            } else if (url.includes('.webm')) {
                contentType = 'video/webm';
            } else if (url.includes('.mov')) {
                contentType = 'video/quicktime';
            } else {
                contentType = 'video/mp4'; // Default fallback
            }
            console.log('🔧 Fixed content type from', response.headers.get('content-type'), 'to', contentType);
        }
        const contentLength = response.headers.get('content-length');
        const acceptRanges = response.headers.get('accept-ranges') || 'bytes';
        const contentRange = response.headers.get('content-range');

        // Set response headers for video streaming (Stremio-compatible)
        res.setHeader('Content-Type', contentType);
        res.setHeader('Accept-Ranges', acceptRanges);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Connection', 'keep-alive');
        
        // Copy important headers from Real-Debrid response
        const headersToProxy = ['etag', 'last-modified', 'server'];
        headersToProxy.forEach(headerName => {
            const headerValue = response.headers.get(headerName);
            if (headerValue) {
                res.setHeader(headerName, headerValue);
            }
        });

        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
            console.log('📏 Content-Length:', contentLength, '(', Math.round(parseInt(contentLength) / 1024 / 1024), 'MB)');
        } else {
            console.log('⚠️  No Content-Length header from Real-Debrid');
        }

        if (contentRange) {
            res.setHeader('Content-Range', contentRange);
            res.status(206); // Partial Content
            console.log('📋 Returning partial content:', contentRange);
        } else if (range) {
            console.log('⚠️  Range requested but no Content-Range in response');
        }

        console.log('🚀 Starting stream pipeline...');

        // Stream with continuous buffering (like Stremio's streaming server)
        const startTime = Date.now();
        let bytesStreamed = 0;
        
        try {
            // Don't await the pipeline - let it stream continuously
            const readable = Readable.fromWeb(response.body);
            let lastLogTime = Date.now();
            let isStreamClosed = false;
            
            // Centralized cleanup function to prevent memory leaks
            const cleanup = () => {
                if (isStreamClosed) return; // Prevent double cleanup
                isStreamClosed = true;
                
                try {
                    // Remove all event listeners to prevent memory leaks
                    readable.removeAllListeners();
                    readable.destroy();
                    
                    // Clear any potential circular references
                    bytesStreamed = null;
                } catch (cleanupError) {
                    console.warn('⚠️ Cleanup error:', cleanupError.message);
                }
            };
            
            // Track streaming progress with throttled logging
            readable.on('data', (chunk) => {
                if (isStreamClosed) return;
                
                bytesStreamed += chunk.length;
                const now = Date.now();
                
                // Throttled logging to prevent memory buildup from frequent logs
                if (now - lastLogTime > 5000) { // Log every 5 seconds instead of every 5MB
                    console.log('📊 Streamed:', Math.round(bytesStreamed / 1024 / 1024), 'MB');
                    lastLogTime = now;
                }
            });
            
            readable.on('end', () => {
                if (isStreamClosed) return;
                const duration = Date.now() - startTime;
                console.log('✅ Stream ended naturally');
                console.log('📊 Total streamed:', Math.round(bytesStreamed / 1024 / 1024), 'MB in', duration, 'ms');
                cleanup();
            });
            
            readable.on('error', (error) => {
                if (isStreamClosed) return;
                const duration = Date.now() - startTime;
                console.error('❌ Stream error after', duration, 'ms, streamed', Math.round(bytesStreamed / 1024 / 1024), 'MB:', error.message);
                cleanup();
            });
            
            // Handle client disconnection
            res.on('close', () => {
                if (isStreamClosed) return;
                const duration = Date.now() - startTime;
                console.log('🔌 Client disconnected after', duration, 'ms, streamed', Math.round(bytesStreamed / 1024 / 1024), 'MB');
                cleanup();
            });
            
            // Handle process termination
            const processCleanup = () => {
                cleanup();
            };
            process.once('SIGTERM', processCleanup);
            process.once('SIGINT', processCleanup);
            
            // Pipe without awaiting - allows continuous streaming
            readable.pipe(res);
            
            // Remove process listeners when stream ends to prevent accumulation
            res.on('finish', () => {
                process.removeListener('SIGTERM', processCleanup);
                process.removeListener('SIGINT', processCleanup);
            });
            
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Video proxy error after', duration, 'ms:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream error', message: error.message });
            }
        }

    } catch (error) {
        console.error('❌ Video proxy error:', error);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// HLS Transcoding endpoints (Stremio approach)
// Store active transcoding sessions
const transcodingSessions = new Map();

// Security: Validate media URLs to prevent command injection
const validateMediaURL = (url) => {
    try {
        const urlObj = new URL(url);
        
        // Whitelist allowed domains for streaming
        const allowedDomains = [
            'real-debrid.com',
            'download.real-debrid.com',
            'sgp1-4.download.real-debrid.com',
            // Add other trusted domains as needed
        ];
        
        // Check if domain is allowed
        const isDomainAllowed = allowedDomains.some(domain => 
            urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );
        
        if (!isDomainAllowed) {
            console.warn('🚨 Blocked URL from untrusted domain:', urlObj.hostname);
            return false;
        }
        
        // Additional security checks
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
            console.warn('🚨 Blocked URL with invalid protocol:', urlObj.protocol);
            return false;
        }
        
        // Check for potential command injection patterns
        const dangerousPatterns = [
            /[;&|`$(){}[\]]/,  // Shell metacharacters
            /\.\./,            // Directory traversal
            /file:\/\//i,      // Local file access
            /javascript:/i,    // JavaScript protocol
            /data:/i           // Data URLs
        ];
        
        if (dangerousPatterns.some(pattern => pattern.test(url))) {
            console.warn('🚨 Blocked URL with dangerous patterns:', url.substring(0, 100));
            return false;
        }
        
        return true;
    } catch (error) {
        console.warn('🚨 Invalid URL format:', error.message);
        return false;
    }
};

// Sanitize URLs for logging (remove sensitive parameters)
const sanitizeURLForLogging = (url) => {
    try {
        return url.replace(/([?&])(token|key|auth|api_key|access_token)=[^&]*/gi, '$1$2=***');
    } catch {
        return 'invalid-url';
    }
};

// HLS Master playlist endpoint
app.get('/api/hls/:sessionId/master.m3u8', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { mediaURL } = req.query;
        // const { videoCodecs, audioCodecs, format } = req.query; // Reserved for future use
        
        if (!mediaURL) {
            return res.status(400).json({ error: 'mediaURL parameter required' });
        }
        
        // Validate media URL for security
        if (!validateMediaURL(mediaURL)) {
            return res.status(403).json({ 
                error: 'Invalid or untrusted media URL',
                message: 'Media URL must be from a trusted streaming domain'
            });
        }
        
        console.log('🎬 HLS Master playlist request:', { 
            sessionId, 
            mediaURL: sanitizeURLForLogging(mediaURL).substring(0, 100) + '...' 
        });
        
        // Generate master playlist for single quality stream
        const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080,CODECS="avc1.64001f,mp4a.40.2"
playlist.m3u8?${new URLSearchParams(req.query).toString()}

`;
        
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(masterPlaylist);
        
    } catch (error) {
        console.error('❌ HLS Master playlist error:', error);
        res.status(500).json({ error: 'Failed to generate master playlist' });
    }
});

// HLS Playlist endpoint  
app.get('/api/hls/:sessionId/playlist.m3u8', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // const { mediaURL } = req.query; // Reserved for future playlist generation
        
        console.log('📋 HLS Playlist request:', { sessionId });
        
        // For now, generate a simple live playlist that points to segments
        // In a full implementation, this would be dynamically generated as FFmpeg creates segments
        const queryString = new URLSearchParams(req.query).toString();
        const playlist = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:10.0,
segment0.ts?${queryString}
#EXTINF:10.0,
segment1.ts?${queryString}
#EXTINF:10.0,
segment2.ts?${queryString}
#EXT-X-ENDLIST
`;
        
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(playlist);
        
    } catch (error) {
        console.error('❌ HLS Playlist error:', error);
        res.status(500).json({ error: 'Failed to generate playlist' });
    }
});

// HLS Segment endpoint
app.get('/api/hls/:sessionId/segment:segmentId.ts', async (req, res) => {
    try {
        const { sessionId, segmentId } = req.params;
        const { mediaURL } = req.query;
        
        if (!mediaURL) {
            return res.status(400).json({ error: 'mediaURL parameter required' });
        }
        
        // Validate media URL for security (CRITICAL: Prevents command injection)
        if (!validateMediaURL(mediaURL)) {
            return res.status(403).json({ 
                error: 'Invalid or untrusted media URL',
                message: 'Media URL must be from a trusted streaming domain'
            });
        }
        
        console.log('🎞️ HLS Segment request:', { 
            sessionId, 
            segmentId, 
            mediaURL: sanitizeURLForLogging(mediaURL).substring(0, 100) + '...' 
        });
        
        // Start transcoding if not already started for this session
        if (!transcodingSessions.has(sessionId)) {
            console.log('🔄 Starting FFmpeg transcoding session:', sessionId);
            
            // This is a simplified approach - in production you'd want proper segment management
            // For now, we'll stream the raw transcoded output
        }
        
        // Calculate segment start time (each segment is ~10 seconds)
        const segmentIndex = parseInt(segmentId, 10);
        const startTime = segmentIndex * 10;
        
        // Determine FFmpeg args based on available hardware acceleration
        let ffmpegArgs;
        
        // Try AMD GPU acceleration first (VAAPI)
        if (process.env.ENABLE_AMD_GPU !== 'false') {
            ffmpegArgs = [
                '-init_hw_device', 'vaapi=va:/dev/dri/renderD128', // AMD GPU device
                '-hwaccel', 'vaapi',
                '-hwaccel_output_format', 'vaapi',
                '-i', mediaURL,
                '-ss', startTime.toString(),
                '-t', '10', // 10 second segments
                '-vf', 'scale_vaapi=format=nv12', // AMD GPU scaling
                '-vcodec', 'h264_vaapi', // AMD GPU H.264 encoder
                '-acodec', 'aac',
                '-f', 'mpegts',
                '-preset', 'ultrafast',
                '-g', '30', // GOP size
                '-sc_threshold', '0',
                '-'
            ];
            console.log('🚀 Using AMD GPU acceleration (VAAPI)');
        } else {
            // Fallback to CPU encoding
            ffmpegArgs = [
                '-i', mediaURL,
                '-ss', startTime.toString(),
                '-t', '10', // 10 second segments
                '-vcodec', 'libx264', // CPU H.264 encoder
                '-acodec', 'aac',
                '-f', 'mpegts',
                '-preset', 'ultrafast', // Fast encoding for real-time
                '-tune', 'zerolatency',
                '-g', '30', // GOP size
                '-sc_threshold', '0',
                '-'
            ];
            console.log('💻 Using CPU transcoding (fallback)');
        }
        
        console.log('🛠️ Starting FFmpeg with args:', ffmpegArgs.join(' '));
        
        const startTranscode = (args, isGpuAttempt = false) => {
            const ffmpeg = spawn('ffmpeg', args);
            let isProcessClosed = false;
            
            // Centralized cleanup for FFmpeg process
            const cleanup = () => {
                if (isProcessClosed) return;
                isProcessClosed = true;
                
                try {
                    // Kill FFmpeg process if still running
                    if (!ffmpeg.killed) {
                        ffmpeg.kill('SIGTERM');
                        
                        // Force kill after 5 seconds if it doesn't respond
                        setTimeout(() => {
                            if (!ffmpeg.killed) {
                                ffmpeg.kill('SIGKILL');
                            }
                        }, 5000);
                    }
                    
                    // Remove all listeners to prevent memory leaks
                    ffmpeg.stdout.removeAllListeners();
                    ffmpeg.stderr.removeAllListeners();
                    ffmpeg.removeAllListeners();
                } catch (cleanupError) {
                    console.warn('⚠️ FFmpeg cleanup error:', cleanupError.message);
                }
            };
            
            res.setHeader('Content-Type', 'video/mp2t');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'no-cache');
            
            ffmpeg.stdout.pipe(res);
            
            let stderrBuffer = '';
            const maxBufferSize = 10 * 1024; // Limit stderr buffer to 10KB
            
            ffmpeg.stderr.on('data', (data) => {
                if (isProcessClosed) return;
                
                const output = data.toString();
                
                // Limit buffer size to prevent memory bloat
                if (stderrBuffer.length < maxBufferSize) {
                    stderrBuffer += output;
                }
                
                // Only log important FFmpeg messages, not all output
                if (output.includes('error') || output.includes('warning') || output.includes('fps=')) {
                    console.log('FFmpeg:', output.trim());
                }
            });
            
            ffmpeg.on('close', (code) => {
                if (isProcessClosed) return;
                console.log('🏁 FFmpeg process exited with code:', code);
                
                // If GPU encoding failed and we haven't tried CPU fallback yet
                if (code !== 0 && isGpuAttempt && stderrBuffer.includes('vaapi')) {
                    console.log('⚠️ AMD GPU encoding failed, falling back to CPU...');
                    
                    // Cleanup current process first
                    cleanup();
                    
                    // Fallback to CPU encoding
                    const cpuArgs = [
                        '-i', mediaURL,
                        '-ss', startTime.toString(),
                        '-t', '10',
                        '-vcodec', 'libx264',
                        '-acodec', 'aac',
                        '-f', 'mpegts',
                        '-preset', 'ultrafast',
                        '-tune', 'zerolatency',
                        '-g', '30',
                        '-sc_threshold', '0',
                        '-'
                    ];
                    
                    if (!res.headersSent) {
                        startTranscode(cpuArgs, false);
                    }
                } else {
                    cleanup();
                }
            });
            
            ffmpeg.on('error', (error) => {
                if (isProcessClosed) return;
                console.error('❌ FFmpeg error:', error);
                
                // If GPU encoding failed and we haven't tried CPU fallback yet
                if (isGpuAttempt && !res.headersSent) {
                    console.log('⚠️ AMD GPU encoding error, falling back to CPU...');
                    
                    // Cleanup current process first
                    cleanup();
                    
                    const cpuArgs = [
                        '-i', mediaURL,
                        '-ss', startTime.toString(),
                        '-t', '10',
                        '-vcodec', 'libx264',
                        '-acodec', 'aac',
                        '-f', 'mpegts',
                        '-preset', 'ultrafast',
                        '-tune', 'zerolatency',
                        '-g', '30',
                        '-sc_threshold', '0',
                        '-'
                    ];
                    
                    startTranscode(cpuArgs, false);
                } else {
                    cleanup();
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Transcoding failed' });
                    }
                }
            });
            
            // Handle client disconnection
            res.on('close', () => {
                console.log('🔌 Client disconnected, killing FFmpeg process');
                cleanup();
            });
            
            // Handle process termination
            const processCleanup = () => {
                cleanup();
            };
            process.once('SIGTERM', processCleanup);
            process.once('SIGINT', processCleanup);
            
            // Remove process listeners when done to prevent accumulation
            res.on('finish', () => {
                process.removeListener('SIGTERM', processCleanup);
                process.removeListener('SIGINT', processCleanup);
            });
        };
        
        // Start transcoding with appropriate method
        const isGpuAttempt = process.env.ENABLE_AMD_GPU !== 'false';
        startTranscode(ffmpegArgs, isGpuAttempt);
        
    } catch (error) {
        console.error('❌ HLS Segment error:', error);
        res.status(500).json({ error: 'Failed to generate segment' });
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