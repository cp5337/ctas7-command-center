# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CTAS-7 bolt.diy Containerized Code Generation Engine
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Self-hosted bolt.diy for deterministic AI code generation
# Integrated with CTAS Agent Studio and Intelligent Transpiler
#
# Port: 5173 (default Vite port)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM node:20-slim AS base

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Clone bolt.diy repository
FROM base AS clone
RUN git clone https://github.com/stackblitz-labs/bolt.diy.git /app/bolt

# Install dependencies
FROM clone AS deps
WORKDIR /app/bolt
RUN npm install

# Build the application
FROM deps AS build
WORKDIR /app/bolt
RUN npm run build

# Production image
FROM node:20-slim AS production

WORKDIR /app

# Copy built application
COPY --from=build /app/bolt /app

# Install production dependencies only
RUN cd /app && npm install --production

# Create necessary directories
RUN mkdir -p /app/projects /app/cache

# Environment variables
ENV NODE_ENV=production
ENV PORT=5173
ENV HOST=0.0.0.0

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5173/health || exit 1

# Start the application
CMD ["npm", "run", "start"]

