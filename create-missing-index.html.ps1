# Create Missing index.html File (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create Missing index.html File" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_DIR = "$env:USERPROFILE\GalileoskyParser\WindowsGS"

if (-not (Test-Path $PROJECT_DIR)) {
    Write-Host "[ERROR] Project directory not found: $PROJECT_DIR" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] Creating missing index.html file..." -ForegroundColor Blue
Write-Host ""

$PUBLIC_DIR = "$PROJECT_DIR\frontend\public"
Set-Location $PUBLIC_DIR

Write-Host "[INFO] Creating index.html in: $PUBLIC_DIR" -ForegroundColor Blue

# Create the index.html file
$indexHtml = @"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="description" content="Galileosky Parser Windows Application" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Galileosky Parser</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"@

$indexHtml | Out-File -FilePath "index.html" -Encoding UTF8
Write-Host "[OK] index.html created successfully!" -ForegroundColor Green

# Also create manifest.json if it doesn't exist
if (-not (Test-Path "manifest.json")) {
    Write-Host "[INFO] Creating manifest.json..." -ForegroundColor Blue
    
    $manifestJson = @"
{
  "short_name": "Galileosky Parser",
  "name": "Galileosky Parser Windows Application",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
"@
    
    $manifestJson | Out-File -FilePath "manifest.json" -Encoding UTF8
    Write-Host "[OK] manifest.json created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Files Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now build the frontend:" -ForegroundColor Yellow
Write-Host "cd .. && npm run build" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit" 