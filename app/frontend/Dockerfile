# Stage 1: Install dependencies
FROM node:22-alpine AS deps

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY app/frontend/package*.json ./app/frontend/
COPY app/backend/package*.json ./app/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies (include backend workspace so @partner-portal/backend resolves)
RUN npm ci --workspace=app/frontend --workspace=app/backend --workspace=packages/shared

# Stage 2: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/frontend/node_modules ./app/frontend/node_modules

# Copy source code
COPY package*.json ./
COPY tsconfig.json ./
COPY app/frontend ./app/frontend
COPY app/backend ./app/backend
COPY packages/shared ./packages/shared

# Remove config files that cause build issues
RUN rm -f app/frontend/openapi-ts.config.ts
RUN rm -f app/backend/openapi-ts.config.ts

# Build shared package first (if needed)
WORKDIR /app/packages/shared
RUN npm run build 2>/dev/null || true

# Build Next.js application
WORKDIR /app/app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/app/frontend/next.config.mjs ./
COPY --from=builder /app/app/frontend/package*.json ./

# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/app/frontend/public ./public

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "app/frontend/server.js"]
