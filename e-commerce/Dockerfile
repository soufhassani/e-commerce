# --- Stage 1: Builder ---
FROM node:18.20.4-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all files and build Next.js
COPY . .
RUN npm run build


# --- Stage 2: Runner (Production) ---
FROM node:18.20.4-alpine AS runner

WORKDIR /app

# Copy only standalone build output and public assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Security: Create and use non-root user
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -s /bin/sh -D nextjsuser
USER nextjsuser

EXPOSE 3000
CMD ["node", "server.js"]
