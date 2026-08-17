# ----------------------------------------------------
# Stage 1: Build Dependencies & Prisma Client
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl

# Copy package descriptors
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for prisma generate
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# ----------------------------------------------------
# Stage 2: Production Runner
# ----------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma runtime and curl for healthchecks
RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install production-only dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npm cache clean --force

# Copy generated Prisma Client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source code
COPY src ./src
COPY public ./public

# Ensure uploads directory exists and set permissions
RUN mkdir -p /app/public/uploads && chown -R node:node /app

# Switch to non-root user for security
USER node

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
