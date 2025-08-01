# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Clean up dev dependencies after build
RUN npm install --only=production --ignore-scripts && npm cache clean --force

# FFmpeg stage - install transcoding dependencies
FROM node:20-alpine AS ffmpeg-builder

# Install FFmpeg with AMD GPU support and required codecs for HLS transcoding
RUN apk add --no-cache \
    ffmpeg \
    ffmpeg-libs \
    ffmpeg-dev \
    x264 \
    x264-libs \
    x265 \
    x265-libs \
    mesa-dev \
    mesa-dri-gallium \
    mesa-va-gallium \
    libva \
    libva-utils \
    libdrm

# Production stage
FROM node:20-alpine AS runner

# Install system dependencies including FFmpeg with AMD GPU support
RUN apk add --no-cache \
    dumb-init \
    ffmpeg \
    ffmpeg-libs \
    x264 \
    x264-libs \
    x265 \
    x265-libs \
    mesa-dev \
    mesa-dri-gallium \
    mesa-va-gallium \
    libva \
    libva-utils \
    libdrm \
    ca-certificates \
    tzdata

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S highseas -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=highseas:nodejs /app/dist dist/
COPY --from=builder --chown=highseas:nodejs /app/node_modules node_modules/
COPY --from=builder --chown=highseas:nodejs /app/package.json .
COPY --from=builder --chown=highseas:nodejs /app/server server/

# Switch to non-root user
USER highseas

# Expose port 6969
EXPOSE 6969

# Set environment variables
ENV NODE_ENV=production
ENV PORT=6969
ENV BODY_SIZE_LIMIT=0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "http.get('http://localhost:6969/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]