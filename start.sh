#!/bin/bash

# HighSeas Development Server Startup Script
# Starts both backend (Express) and frontend (Vite) servers

set -e  # Exit on any error

echo "🚀 Starting HighSeas Development Servers..."
echo "=========================================="

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "   ✓ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "   ✓ Frontend server stopped"
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start backend server in background
echo "🔧 Starting backend server (Express)..."
npm start > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend server failed to start. Check backend.log for details."
    cat backend.log
    exit 1
fi

echo "   ✓ Backend server running on http://localhost:6969 (PID: $BACKEND_PID)"

# Start frontend server in foreground
echo "🎨 Starting frontend server (Vite)..."
echo "   ✓ Frontend will be available at http://localhost:5173"
echo ""
echo "📋 Available endpoints:"
echo "   • Frontend:        http://localhost:5173"
echo "   • Backend API:     http://localhost:6969/api"
echo "   • Health Check:    http://localhost:6969/api/health"
echo "   • Real-Debrid API: http://localhost:6969/api/realdebrid"
echo "   • Video Proxy:     http://localhost:6969/api/proxy"
echo "   • HLS Transcoding: http://localhost:6969/api/hls/{sessionId}/master.m3u8"
echo "   • Subtitles Proxy: http://localhost:6969/api/subtitles"
echo "   • Logging API:     http://localhost:6969/api/logs"
echo ""
echo "📄 Development logs will be saved to: ./logs/app-$(date +%Y-%m-%d).log"
echo ""
echo "💡 Tips:"
echo "   • Press Ctrl+C to stop both servers"
echo "   • Check logs after testing: cat logs/app-$(date +%Y-%m-%d).log"
echo "   • Purge logs after debugging: rm logs/*.log"
echo "   • Test video proxy: curl -I 'http://localhost:6969/api/proxy?url=...' "
echo "   • Backend server logs: tail -f backend.log"
echo "   • HLS transcoding requires FFmpeg installed (for MKV support)"
echo ""
echo "=========================================="

# Start frontend (this will run in foreground)
npm run dev

# This should not be reached unless npm run dev exits
cleanup