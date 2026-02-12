FROM node:22-slim AS base

# Build stage: install deps + build in one stage to avoid symlink issues
FROM base AS builder
WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./
COPY app/frontend/package.json ./app/frontend/
COPY app/backend/package.json ./app/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies directly in builder (avoids broken .bin symlinks from cross-stage COPY)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source code and openapi specs
COPY . .
COPY openapi ./openapi

# Generate API client and build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run generate:client --workspace=app/frontend

# Build the frontend
RUN npm run build:frontend

# Production image, copy all the files and run next
FROM base AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build
# Next.js standalone output puts dependencies and the server.js in .next/standalone
# In a monorepo, the structure inside standalone mirrors the project structure:
# .next/standalone/app/frontend/server.js
COPY --from=builder --chown=nextjs:nodejs /app/app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app/frontend/.next/static ./app/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/app/frontend/public ./app/frontend/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "app/frontend/server.js"]
