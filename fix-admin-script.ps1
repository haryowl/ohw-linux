# Fix for missing create-default-admin.js in backend directory
Write-Host "Fixing missing create-default-admin.js file..." -ForegroundColor Green

$projectPath = "C:\Projects\gali-parse"

# Check if we're in the right directory
if (!(Test-Path "$projectPath\backend")) {
    Write-Host "Error: Backend directory not found. Make sure you're in the correct project directory." -ForegroundColor Red
    exit 1
}

# Copy create-default-admin.js to backend directory if it exists in root
if (Test-Path "$projectPath\create-default-admin.js") {
    Copy-Item "$projectPath\create-default-admin.js" "$projectPath\backend\" -Force
    Write-Host "✓ create-default-admin.js copied to backend directory" -ForegroundColor Green
} else {
    Write-Host "Warning: create-default-admin.js not found in root directory" -ForegroundColor Yellow
}

# Now run the admin creation script
Write-Host "Creating default admin user..." -ForegroundColor Yellow
Set-Location "$projectPath\backend"
try {
    node create-default-admin.js
    Write-Host "✓ Admin user created successfully" -ForegroundColor Green
} catch {
    Write-Host "Error creating admin user: $_" -ForegroundColor Red
}

Set-Location $projectPath
Write-Host "Fix completed!" -ForegroundColor Green 