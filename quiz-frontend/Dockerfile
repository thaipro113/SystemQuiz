# ── Stage 1: Build React app ────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước để cache layer
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Nhận API URL lúc build time
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Build production
RUN npm run build

# ── Stage 2: Serve với Nginx ─────────────────────────────
FROM nginx:alpine AS runtime

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config cho React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
