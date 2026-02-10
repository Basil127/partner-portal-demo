# Docker Setup Status & Next Steps

## What Has Been Completed ✅

### 1. Docker Compose Configuration
- **Created**: `docker-compose.yml` with 5 services:
  - `frontend`: Next.js app on port 3000
  - `backend`: Fastify API on port 3001
  - `mock-api`: FastAPI mock Oracle OPERA API on port 8000
  - `db`: PostgreSQL 18.1 on port 5432
  - `migrator`: Alembic database migration service

### 2. Dockerfiles Created/Updated
- **Backend** (`app/backend/Dockerfile`):
  - Multi-stage build with Node 22-alpine
  - Fixed to work with npm workspaces (dependencies in root `/app/node_modules`)
  - Successfully builds image: `ohm-demo-backend:latest`
  
- **Mock-API** (`app/mock-api/Dockerfile`):
  - Multi-stage build with Python 3.13-slim
  - Uses `uv` package manager (not poetry)
  - Two targets: `prod` and `dev` (dev includes test dependencies for migrator)
  - Successfully builds image: `ohm-demo-mock-api:latest`
  
- **Frontend** (`app/frontend/Dockerfile`):
  - Multi-stage build with Node 22-alpine
  - Next.js standalone output mode
  - **BUILD FAILS** - see issues below

### 3. Configuration Fixes Applied
- **Backend `tsconfig.build.json`**: Removed `"rootDir": "src"` to allow importing from `../../packages/shared`
- **Frontend `next.config.mjs`**: Added `output: "standalone"` for optimized Docker image
- **Root `.dockerignore`**: Created comprehensive ignore file to optimize build context
- **Mock-API case sensitivity**: Renamed `OperaClone2/` folder to `operaclone2/` (lowercase) to match Python imports
- **Mock-API `alembic.ini`**: Fixed `script_location` to use lowercase `operaclone2/db/migrations`
- **Mock-API imports**: Fixed all Python imports from `OperaClone2` to `operaclone2` (69 files updated)

### 4. GitHub Actions Workflow
- **Updated**: `.github/workflows/tests.yml` for app/mock-api
- Converted from poetry to uv package manager
- Added PostgreSQL service container
- Separate jobs for lint (ruff, mypy) and pytest

## Critical Issues Blocking Full Deployment 🚨

### Issue #1: Frontend Build Fails (HIGH PRIORITY)
**Error:**
```
Type error: Cannot find module '@partner-portal/backend/api-types' or its corresponding type declarations.
File: ./src/app/(admin)/(primary)/hotels/[hotelId]/room/[roomId]/page.tsx:11:38
```

**Root Cause:** Frontend code imports types from backend that don't exist:
```typescript
import type { ContentRoomType } from '@partner-portal/backend/api-types';
```

**Resolution Options:**
1. **Option A (Recommended)**: Create the missing `api-types` export in backend
   - Add `app/backend/src/api-types.ts` or `app/backend/api-types.ts`
   - Export the `ContentRoomType` and other types frontend needs
   - Add to `app/backend/package.json`: `"exports": { "./api-types": "./src/api-types.ts" }`

2. **Option B**: Remove/comment out the import in frontend and use inline types temporarily

3. **Option C**: Check if types should come from `@partner-portal/shared` instead

**Impact:** Frontend cannot build, so full stack cannot start

### Issue #2: Migrator Service Fails (HIGH PRIORITY)
**Status:** Keeps exiting with code 1

**Last Known Logs:** Need to run `docker-compose logs migrator` to see latest error

**Likely Causes:**
- Migration script errors
- Database connection issues (though DB container is healthy)
- Python import errors in migration scripts
- Alembic configuration issues

**Next Steps:**
1. Run: `docker-compose logs --tail=50 migrator`
2. Check if database tables already exist (might need `alembic downgrade base` or fresh DB)
3. Verify `operaclone2/db/migrations/env.py` has correct imports
4. Test migrations locally: `cd app/mock-api && uv run alembic upgrade head`

**Impact:** Mock-API depends on migrator completing, so it won't start until this is fixed

### Issue #3: Backend/Mock-API Not Running (MEDIUM PRIORITY)
**Observation:** Containers exist but show status as "Created" not "Up"

**Root Cause:** Docker Compose dependency chain:
```
frontend → backend → mock-api → migrator → db
```
If migrator fails, the chain breaks and dependent services don't start.

**Verification Needed:**
```powershell
docker-compose ps -a
docker-compose logs backend
docker-compose logs mock-api
```

### Issue #4: Database Volume Warning (LOW PRIORITY)
**Warning:**
```
volume "OperaClone2-db-data" already exists but was created for project "operaclone2"
```

**Fix:** In `docker-compose.yml`, add to volumes section:
```yaml
volumes:
  backend-data:
  OperaClone2-db-data:
    external: true  # Add this line
```

Or rename the volume to `ohm-demo-db-data` everywhere.

## Current Working State

**✅ Successfully Building:**
- Backend Docker image
- Mock-API Docker image
- Database container (PostgreSQL)

**❌ Not Building:**
- Frontend (type import error)

**❌ Not Running:**
- Backend (waiting on dependencies)
- Mock-API (waiting on migrator)
- Migrator (exits with error)

## Quick Commands for Debugging

```powershell
# Check all container status
docker-compose ps -a

# View logs for specific service
docker-compose logs --tail=50 migrator
docker-compose logs --tail=50 backend
docker-compose logs --tail=50 mock-api

# Rebuild specific service
docker-compose build backend
docker-compose build mock-api

# Start without frontend
docker-compose up -d backend mock-api db migrator

# Test database connection
docker-compose exec db psql -U OperaClone2 -d OperaClone2 -c "\dt"

# Test migrator manually
docker-compose run --rm migrator alembic current

# Stop all and clean up
docker-compose down
docker-compose down -v  # Also removes volumes
```

## Recommended Action Plan

### Step 1: Fix Migrator (15 min)
1. Run `docker-compose logs migrator` to identify exact error
2. If it's import errors, verify all files in `app/mock-api/operaclone2/` (lowercase)
3. If it's migration errors, check migration scripts or create fresh DB
4. Test: `docker-compose up -d db && docker-compose run --rm migrator`

### Step 2: Start Backend & Mock-API (5 min)
1. Once migrator succeeds, start: `docker-compose up -d backend mock-api`
2. Verify: `curl http://localhost:3001` (backend) and `curl http://localhost:8000/docs` (mock-api)
3. Check logs if either fails to start

### Step 3: Fix Frontend Build (30 min)
1. Search backend codebase for where `ContentRoomType` should be defined
2. Create `app/backend/src/api-types.ts` with exported types
3. Update `app/backend/package.json` exports section
4. Rebuild: `docker-compose build frontend`
5. Start: `docker-compose up -d frontend`

### Step 4: Test Full Stack (10 min)
1. Run: `docker-compose up -d`
2. Verify all 5 services are healthy: `docker-compose ps`
3. Test endpoints:
   ```powershell
   Invoke-WebRequest http://localhost:3000  # Frontend
   Invoke-WebRequest http://localhost:3001  # Backend
   Invoke-WebRequest http://localhost:8000/docs  # Mock-API
   ```

## File Locations Reference

```
OHM-demo/
├── docker-compose.yml          # Main orchestration file
├── .dockerignore               # Optimizes build context
├── app/
│   ├── backend/
│   │   ├── Dockerfile          # ✅ Working
│   │   └── tsconfig.build.json # Fixed (no rootDir)
│   ├── frontend/
│   │   ├── Dockerfile          # ❌ Builds but fails
│   │   ├── next.config.mjs     # Has standalone output
│   │   └── src/app/(admin)/(primary)/hotels/[hotelId]/room/[roomId]/page.tsx  # ❌ Import error here
│   └── mock-api/
│       ├── Dockerfile          # ✅ Working
│       ├── alembic.ini         # Fixed paths (lowercase)
│       └── operaclone2/        # ✅ Renamed to lowercase
│           └── db/
│               └── migrations/
│                   └── env.py  # Fixed imports
└── .github/
    └── workflows/
        └── tests.yml           # ✅ Updated for uv
```

## Architecture Notes

- **Workspaces**: Root uses npm workspaces, all dependencies in `/app/node_modules` (not per-package)
- **Build Context**: All Dockerfiles use repository root as context
- **Package Manager**: Backend/frontend use npm; mock-api uses uv (not poetry)
- **Python Case**: Linux containers are case-sensitive, so `operaclone2` != `OperaClone2`

## Environment Variables Needed

Currently using `.env` file for docker-compose. Ensure these are set:
- `POSTGRES_PASSWORD=OperaClone2`
- `POSTGRES_USER=OperaClone2`
- `POSTGRES_DB=OperaClone2`
- Backend needs: `EXTERNAL_CLIENT_BASE_URL=http://mock-api:8000`
- Mock-API needs: Database connection string pointing to `db:5432`

---

**Last Updated:** February 10, 2026  
**Status:** 60% Complete - Backend/Mock-API build successfully, Frontend and Migrator need fixes
