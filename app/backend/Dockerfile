# Stage 1: Install dependencies
FROM node:22-slim AS deps

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY app/backend/package*.json ./app/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies (install all to ensure root devDeps like openapi-ts are available)
RUN npm ci

# Stage 2: Build the application
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY package*.json ./
COPY tsconfig.json ./
COPY app/backend ./app/backend
COPY packages/shared ./packages/shared
COPY openapi ./openapi

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Generate client (run from root to access binaries correctly)
WORKDIR /app
RUN npm run generate:client --workspace=app/backend

# Build backend
WORKDIR /app/app/backend
RUN npm run build

# Prune dev dependencies to reduce image size
WORKDIR /app
RUN npm prune --production

# Stage 3: Production image
FROM node:22-slim AS prod

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Copy pruned node_modules from builder
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules

# Copy workspace artifacts
COPY --from=builder --chown=backend:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=backend:nodejs /app/app/backend/package.json ./app/backend/

# Copy built files
COPY --from=builder --chown=backend:nodejs /app/app/backend/dist ./app/backend/dist

# Create data directory for SQLite if needed
RUN mkdir -p app/backend/data && chown -R backend:nodejs app

USER backend

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

CMD ["node", "app/backend/dist/app/backend/src/index.js"]
