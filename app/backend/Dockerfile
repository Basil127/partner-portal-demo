# Stage 1: Install dependencies
FROM node:22-alpine AS deps

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY app/backend/package*.json ./app/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=app/backend --workspace=packages/shared

# Stage 2: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage (workspace installs all in root node_modules)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY package*.json ./
COPY tsconfig.json ./
COPY app/backend ./app/backend
COPY packages/shared ./packages/shared

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build 2>/dev/null || true

# Build backend
WORKDIR /app/app/backend
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Copy workspace structure and built files
COPY --from=builder --chown=backend:nodejs /app/package*.json ./
COPY --from=builder --chown=backend:nodejs /app/app/backend/dist ./app/backend/dist
COPY --from=builder --chown=backend:nodejs /app/app/backend/package*.json ./app/backend/
COPY --from=builder --chown=backend:nodejs /app/packages/shared ./packages/shared

# Copy node_modules (workspace installs everything in root node_modules)
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules

# Create data directory for SQLite
RUN mkdir -p app/backend/data && chown -R backend:nodejs app

USER backend

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

WORKDIR /app/app/backend

CMD ["node", "dist/app/backend/src/index.js"]
