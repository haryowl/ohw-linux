@echo off
echo ========================================
echo Fix Missing Frontend Files
echo ========================================
echo.

set "PROJECT_DIR=%USERPROFILE%\GalileoskyParser\WindowsGS"

if not exist "%PROJECT_DIR%" (
    echo [ERROR] Project directory not found: %PROJECT_DIR%
    pause
    exit /b 1
)

echo [INFO] Fixing missing frontend files in: %PROJECT_DIR%
echo.

cd /d "%PROJECT_DIR%"

echo [INFO] Pulling latest changes from GitHub...
git pull origin main

echo [INFO] Checking for missing files...
if not exist "frontend\public\index.html" (
    echo [ERROR] index.html is missing from frontend\public\
    echo [INFO] Creating index.html...
    
    echo ^<!DOCTYPE html^> > "frontend\public\index.html"
    echo ^<html lang="en"^> >> "frontend\public\index.html"
    echo   ^<head^> >> "frontend\public\index.html"
    echo     ^<meta charset="utf-8" /^> >> "frontend\public\index.html"
    echo     ^<link rel="icon" href="%%PUBLIC_URL%%/favicon.ico" /^> >> "frontend\public\index.html"
    echo     ^<meta name="viewport" content="width=device-width, initial-scale=1" /^> >> "frontend\public\index.html"
    echo     ^<meta name="theme-color" content="#000000" /^> >> "frontend\public\index.html"
    echo     ^<meta name="description" content="Galileosky Parser Windows Application" /^> >> "frontend\public\index.html"
    echo     ^<title^>Galileosky Parser^</title^> >> "frontend\public\index.html"
    echo   ^</head^> >> "frontend\public\index.html"
    echo   ^<body^> >> "frontend\public\index.html"
    echo     ^<noscript^>You need to enable JavaScript to run this app.^</noscript^> >> "frontend\public\index.html"
    echo     ^<div id="root"^>^</div^> >> "frontend\public\index.html"
    echo   ^</body^> >> "frontend\public\index.html"
    echo ^</html^> >> "frontend\public\index.html"
    
    echo [OK] index.html created
) else (
    echo [OK] index.html exists
)

if not exist "frontend\public\manifest.json" (
    echo [INFO] Creating manifest.json...
    
    echo { > "frontend\public\manifest.json"
    echo   "short_name": "Galileosky Parser", >> "frontend\public\manifest.json"
    echo   "name": "Galileosky Parser Windows Application", >> "frontend\public\manifest.json"
    echo   "icons": [ >> "frontend\public\manifest.json"
    echo     { >> "frontend\public\manifest.json"
    echo       "src": "favicon.ico", >> "frontend\public\manifest.json"
    echo       "sizes": "64x64 32x32 24x24 16x16", >> "frontend\public\manifest.json"
    echo       "type": "image/x-icon" >> "frontend\public\manifest.json"
    echo     } >> "frontend\public\manifest.json"
    echo   ], >> "frontend\public\manifest.json"
    echo   "start_url": ".", >> "frontend\public\manifest.json"
    echo   "display": "standalone", >> "frontend\public\manifest.json"
    echo   "theme_color": "#000000", >> "frontend\public\manifest.json"
    echo   "background_color": "#ffffff" >> "frontend\public\manifest.json"
    echo } >> "frontend\public\manifest.json"
    
    echo [OK] manifest.json created
) else (
    echo [OK] manifest.json exists
)

echo [INFO] Reinstalling frontend dependencies...
cd frontend
call npm install

echo [INFO] Building frontend...
call npm run build

echo.
echo ========================================
echo Missing Files Fixed!
echo ========================================
echo.
echo Frontend should now build successfully.
echo You can start it with: node start-server.js
echo.
pause 