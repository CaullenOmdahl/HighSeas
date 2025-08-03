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

# Create logs directory if it doesn't exist
mkdir -p logs

# Start backend server in background
echo "🔧 Starting backend server (Express)..."
npm start > logs/backend-$(date +%Y-%m-%d).log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully by testing the health endpoint
echo "🔍 Checking backend server health..."
for i in {1..10}; do
    if curl -s http://localhost:6969/api/health > /dev/null 2>&1; then
        echo "   ✓ Backend server running on http://localhost:6969 (PID: $BACKEND_PID)"
        break
    elif [ $i -eq 10 ]; then
        echo "❌ Backend server failed to start. Check logs/backend-$(date +%Y-%m-%d).log for details."
        if [ -f "logs/backend-$(date +%Y-%m-%d).log" ]; then
            echo "Recent backend logs:"
            tail -20 "logs/backend-$(date +%Y-%m-%d).log"
        fi
        exit 1
    else
        echo "   ⏳ Waiting for backend server... (attempt $i/10)"
        sleep 1
    fi
done

# Start frontend server in foreground
echo "🎨 Starting frontend server (Vite)..."
echo "   ✓ Frontend will be available at http://localhost:5173"
echo ""
echo "📋 Available endpoints:"
echo "   • Frontend:        http://localhost:5173"
echo "   • Backend API:     http://localhost:6969/api"
echo "   • Health Check:    http://localhost:6969/api/health"
echo "   • Real-Debrid API: http://localhost:6969/api/realdebrid"
echo "   • Subtitles Proxy: http://localhost:6969/api/subtitles"
echo ""
echo "📄 Development logs:"
echo "   • Backend:  ./logs/backend-$(date +%Y-%m-%d).log"
echo "   • App logs: ./logs/app-$(date +%Y-%m-%d).log"
echo ""
echo "💡 Tips:"
echo "   • Press Ctrl+C to stop both servers"
echo "   • Check backend logs: tail -f logs/backend-$(date +%Y-%m-%d).log"
echo "   • Check app logs: tail -f logs/app-$(date +%Y-%m-%d).log"
echo "   • Purge logs after debugging: rm logs/*.log"
echo "   • Test API health: curl http://localhost:6969/api/health"
echo ""
echo "=========================================="

# Start frontend (this will run in foreground)
npm run dev

# This should not be reached unless npm run dev exits
cleanup