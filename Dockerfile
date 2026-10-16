# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Env vars untuk Vite build (di-inject saat Cloud Build)
ARG VITE_BASE_URL
ARG VITE_GOOGLE_OAUTH_CLIENT_ID

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_GOOGLE_OAUTH_CLIENT_ID=$VITE_GOOGLE_OAUTH_CLIENT_ID

# Build static files
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy hasil build dari stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy konfigurasi nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run menggunakan port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
