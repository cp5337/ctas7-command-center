# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Kali JeetKune - Adaptive Security Ingress
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Hardened public endpoint with:
# - Nginx + ModSecurity WAF
# - Rust eBPF packet inspection
# - Phi-3 threat scoring
# - Sub-millisecond response
#
# "Be like water" - Bruce Lee
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
COPY --from=rust-builder /build/target/release/kali-jeetkune /app/kali-jeetkune

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
RUN mkdir -p /var/log/kali-jeetkune \
    /var/cache/kali-jeetkune \
    /app/deception-layer

# Set permissions
RUN chmod +x /app/kali-jeetkune

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f https://localhost/health || exit 1

# Expose ports
EXPOSE 443 18150

# Start script
COPY start-jeetkune.sh /app/start-jeetkune.sh
RUN chmod +x /app/start-jeetkune.sh

CMD ["/app/start-jeetkune.sh"]

