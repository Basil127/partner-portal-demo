# Test Script for Docker Compose Setup

Write-Host "Testing Docker Compose Setup..." -ForegroundColor Green

# Check if Docker is running
Write-Host "`nChecking Docker..." -ForegroundColor Yellow
docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running!" -ForegroundColor Red
    exit 1
}

# Build all images
Write-Host "`nBuilding Docker images (this may take a while)..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Start services
Write-Host "`nStarting services..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start services!" -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "`nChecking service status..." -ForegroundColor Yellow
docker-compose ps

# Test endpoints
Write-Host "`nTesting endpoints..." -ForegroundColor Yellow

Write-Host "Testing Frontend (http://localhost:3000)..." -ForegroundColor Cyan
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✓ Frontend is accessible (Status: $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend is not accessible: $_" -ForegroundColor Red
}

Write-Host "Testing Backend (http://localhost:3001)..." -ForegroundColor Cyan
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✓ Backend is accessible (Status: $($backend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not accessible: $_" -ForegroundColor Red
}

Write-Host "Testing Mock API (http://localhost:8000)..." -ForegroundColor Cyan
try {
    $mockapi = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✓ Mock API is accessible (Status: $($mockapi.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Mock API is not accessible: $_" -ForegroundColor Red
}

Write-Host "`nView logs with: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "Stop services with: docker-compose down" -ForegroundColor Yellow
