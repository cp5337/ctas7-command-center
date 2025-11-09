# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Kali JeetTek - Stop-Kick Security Ingress
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Stop attacks before they reach your services
# Like a JeetTek to the tibia - low, fast, economical
#
# - Nginx + ModSecurity WAF
# - Rust eBPF packet inspection
# - Phi-3 threat scoring
# - Sub-millisecond response
#
# 🥋 "Stop them before they touch you"
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM rust:1.75-slim AS rust-builder

WORKDIR /build

# Install dependencies
RUN apt-get update && apt-get install -y \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy Rust code
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build release binary
RUN cargo build --release

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM nginx:alpine AS nginx-base

# Install ModSecurity and dependencies
RUN apk add --no-cache \
    libstdc++ \
    yajl \
    libmaxminddb \
    curl \
    openssl \
    modsecurity \
    modsecurity-nginx

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM nginx-base AS production

WORKDIR /app

# Copy Rust binary
COPY --from=rust-builder /build/target/release/kali-jeettek /app/kali-jeettek

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY modsecurity.conf /etc/modsecurity/modsecurity.conf
COPY crs-setup.conf /etc/modsecurity/crs-setup.conf

# Copy ModSecurity OWASP Core Rule Set
RUN mkdir -p /etc/modsecurity/rules
COPY rules/*.conf /etc/modsecurity/rules/

# Copy custom ATT&CK-based rules
COPY attack-rules/*.conf /etc/modsecurity/attack-rules/

# Create necessary directories
RUN mkdir -p /var/log/kali-jeettek \
    /var/cache/kali-jeettek \
    /app/deception-layer

# Set permissions
RUN chmod +x /app/kali-jeettek

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f https://localhost/health || exit 1

# Expose ports
EXPOSE 443 18150

# Start script
COPY start-jeettek.sh /app/start-jeettek.sh
RUN chmod +x /app/start-jeettek.sh

CMD ["/app/start-jeettek.sh"]

