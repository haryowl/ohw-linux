# Galileosky Parser - Fix Dependencies (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Galileosky Parser - Fix Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_DIR = "$env:USERPROFILE\GalileoskyParser\WindowsGS"

if (-not (Test-Path $PROJECT_DIR)) {
    Write-Host "[ERROR] Project directory not found: $PROJECT_DIR" -ForegroundColor Red
    Write-Host "Please run the installer first." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] Fixing dependencies in: $PROJECT_DIR" -ForegroundColor Blue
Write-Host ""

Set-Location $PROJECT_DIR

Write-Host "[INFO] Clearing npm cache..." -ForegroundColor Blue
npm cache clean --force

Write-Host "[INFO] Installing root dependencies..." -ForegroundColor Blue
npm install

Write-Host "[INFO] Installing backend dependencies..." -ForegroundColor Blue
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Backend installation failed. Retrying..." -ForegroundColor Red
    npm cache clean --force
    npm install
}

Write-Host "[INFO] Installing frontend dependencies..." -ForegroundColor Blue
Set-Location "..\frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend installation failed. Retrying..." -ForegroundColor Red
    npm cache clean --force
    npm install
}

Write-Host "[INFO] Installing mobile frontend dependencies..." -ForegroundColor Blue
Set-Location "..\mobile-frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Mobile frontend installation failed. Retrying..." -ForegroundColor Red
    npm cache clean --force
    npm install
}

Set-Location $PROJECT_DIR

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Dependencies Fixed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start the application:" -ForegroundColor Yellow
Write-Host "cd backend" -ForegroundColor White
Write-Host "npm start" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit" 