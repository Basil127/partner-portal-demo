FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files from root and workspaces to install dependencies
COPY package.json package-lock.json ./
# We need to copy the package.json of all workspaces to satisfy npm ci
COPY app/frontend/package.json ./app/frontend/
COPY app/backend/package.json ./app/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies based on the lockfile
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the frontend
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build --workspace=app/frontend

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

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

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "app/frontend/server.js"]
