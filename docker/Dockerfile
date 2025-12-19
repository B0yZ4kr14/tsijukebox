# =============================================================================
# TSiJUKEBOX Enterprise - Multi-stage Dockerfile
# Optimized production build with nginx
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

LABEL maintainer="B0.y_Z4kr14 <b0yz4kr14@proton.me>"
LABEL description="TSiJUKEBOX Enterprise - Music System for Kiosk"
LABEL version="4.1.0"

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy source files
COPY . .

# Build arguments for environment
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL

# Build arguments for Brand Configuration (NEW)
ARG VITE_SPLASH_ENABLED=true
ARG VITE_SPLASH_VARIANT=default
ARG VITE_SPLASH_DURATION=3000
ARG VITE_LOGO_VARIANT=metal
ARG VITE_LOGO_ANIMATION=splash

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Brand environment variables (NEW)
ENV VITE_SPLASH_ENABLED=$VITE_SPLASH_ENABLED
ENV VITE_SPLASH_VARIANT=$VITE_SPLASH_VARIANT
ENV VITE_SPLASH_DURATION=$VITE_SPLASH_DURATION
ENV VITE_LOGO_VARIANT=$VITE_LOGO_VARIANT
ENV VITE_LOGO_ANIMATION=$VITE_LOGO_ANIMATION

# Build the application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

LABEL maintainer="B0.y_Z4kr14 <b0yz4kr14@proton.me>"
LABEL description="TSiJUKEBOX Enterprise - Production Image"
LABEL version="4.1.0"

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=America/Sao_Paulo

# Create non-root user
RUN addgroup -g 1001 -S tsijukebox && \
    adduser -u 1001 -S tsijukebox -G tsijukebox

# Copy nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set ownership
RUN chown -R tsijukebox:tsijukebox /usr/share/nginx/html && \
    chown -R tsijukebox:tsijukebox /var/cache/nginx && \
    chown -R tsijukebox:tsijukebox /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R tsijukebox:tsijukebox /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Run as non-root user
USER tsijukebox

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# -----------------------------------------------------------------------------
# Stage 3: Development (optional)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies for hot-reload
RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
