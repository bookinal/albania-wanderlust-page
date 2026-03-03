# Multi-stage build for Albania Web Application

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY packages ./packages

# Copy web app
COPY apps/web ./apps/web

# Install all dependencies (including workspaces)
RUN npm ci

# Build the web application
# Use custom vite config without type checking for faster Docker builds
WORKDIR /app/apps/web
ENV VITE_CJS_IGNORE_WARNING=true

# Set default environment variables (override with docker-compose or .env)
ENV VITE_SUPABASE_URL=https://placeholder.supabase.co
ENV VITE_SUPABASE_ANON_KEY=placeholder-key
ENV VITE_FRONTEND_URL=http://localhost:3000

RUN npx vite build --config vite.config.docker.ts

# Stage 2: Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
