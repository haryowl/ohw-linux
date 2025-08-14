# Fix Deployment Issues Script
Write-Host "=== Fixing Deployment Issues ===" -ForegroundColor Green

$projectPath = "C:\Projects\gali-parse"

# Check if we're in the right directory
if (!(Test-Path "$projectPath\backend")) {
    Write-Host "Error: Backend directory not found. Make sure you're in the correct project directory." -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

# Step 1: Build frontend
Write-Host "Step 1: Building frontend..." -ForegroundColor Yellow
Set-Location "$projectPath\frontend"
try {
    npm run build
    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "Error building frontend: $_" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

# Step 2: Stop current services
Write-Host "Step 2: Stopping current services..." -ForegroundColor Yellow
pm2 stop all -s
pm2 delete all -s

# Step 3: Start services
Write-Host "Step 3: Starting services..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

# Step 4: Save PM2 configuration
Write-Host "Step 4: Saving PM2 configuration..." -ForegroundColor Yellow
pm2 save

# Step 5: Configure PM2 Windows service
Write-Host "Step 5: Configuring PM2 Windows service..." -ForegroundColor Yellow
try {
    pm2 install pm2-windows-service
    pm2 startup
    Write-Host "✓ PM2 Windows service configured successfully" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not configure PM2 Windows service automatically." -ForegroundColor Yellow
    Write-Host "You may need to run 'pm2 startup' manually as Administrator." -ForegroundColor Yellow
}

# Step 6: Check service status
Write-Host "Step 6: Checking service status..." -ForegroundColor Yellow
pm2 status

# Step 7: Get server IP
$serverIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"} | Select-Object -First 1).IPAddress

if (!$serverIP) {
    $serverIP = "localhost"
}

Write-Host ""
Write-Host "=== Deployment Issues Fixed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Services are now running:" -ForegroundColor Yellow
Write-Host "- Backend: http://$serverIP:3001" -ForegroundColor Cyan
Write-Host "- Frontend: http://$serverIP:3002" -ForegroundColor Cyan
Write-Host "- TCP Parser: Port 3003" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "- Check status: pm2 status" -ForegroundColor White
Write-Host "- View logs: pm2 logs" -ForegroundColor White
Write-Host "- Restart services: pm2 restart all" -ForegroundColor White
Write-Host "- Stop services: pm2 stop all" -ForegroundColor White
Write-Host ""
Write-Host "If PM2 startup failed, run as Administrator:" -ForegroundColor Yellow
Write-Host "pm2 startup" -ForegroundColor White 