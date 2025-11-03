# CTAS 7.0 Command Center - AI-Drift Protected Container
# Multi-stage build for production-ready deployment
FROM rust:1.75-slim as rust-builder

WORKDIR /app

# Install system dependencies for Rust compilation
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Rust source and build
COPY Cargo.toml Cargo.lock ./
COPY src/main.rs src/voice_engine.rs ./src/
COPY mcp/ ./mcp/
RUN cargo build --release

# Node.js stage for TypeScript/React build
FROM node:20-alpine as node-builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
COPY tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js ./

# Install all dependencies including dev dependencies for build
RUN npm ci --include=dev

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build the application
RUN npm run build

# Final production image
FROM ubuntu:22.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    python3 \
    python3-pip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for voice engine
RUN pip3 install whisper torch torchaudio

# Create application directories
WORKDIR /app

# Copy built artifacts from previous stages
COPY --from=rust-builder /app/target/release/smart-crate-voice /usr/local/bin/
COPY --from=node-builder /app/dist ./dist

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy source code in read-only mode to prevent AI modifications
COPY --chmod=444 src/ ./src-readonly/
COPY --chmod=444 mcp/ ./mcp-readonly/
COPY --chmod=444 *.md ./docs-readonly/

# Create protected backup of critical files
RUN mkdir -p /protected-backup && \
    cp -r ./src-readonly /protected-backup/ && \
    cp -r ./mcp-readonly /protected-backup/ && \
    chmod -R 444 /protected-backup/

# Expose ports
EXPOSE 80 3000 8000 9001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start supervisor to manage multiple processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
