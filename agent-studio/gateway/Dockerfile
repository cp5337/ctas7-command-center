FROM rust:1.75 as builder

WORKDIR /app

# Copy Cargo files
COPY Cargo.toml ./

# Create dummy main to cache dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    echo "fn main() {}" > gateway.rs

# Build dependencies (cached layer)
RUN cargo build --release --bin gateway

# Remove dummy files
RUN rm -rf src gateway.rs

# Copy actual source
COPY gateway.rs ./

# Build real application
RUN cargo build --release --bin gateway

# Runtime image
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/gateway /app/gateway

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 15181

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:15181/health || exit 1

# Run the binary
CMD ["/app/gateway"]

