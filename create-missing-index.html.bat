@echo off
echo ========================================
echo Create Missing index.html File
echo ========================================
echo.

set "PROJECT_DIR=%USERPROFILE%\GalileoskyParser\WindowsGS"

if not exist "%PROJECT_DIR%" (
    echo [ERROR] Project directory not found: %PROJECT_DIR%
    pause
    exit /b 1
)

echo [INFO] Creating missing index.html file...
echo.

cd /d "%PROJECT_DIR%\frontend\public"

echo [INFO] Creating index.html in: %CD%

:: Create the index.html file
echo ^<!DOCTYPE html^> > index.html
echo ^<html lang="en"^> >> index.html
echo   ^<head^> >> index.html
echo     ^<meta charset="utf-8" /^> >> index.html
echo     ^<link rel="icon" href="%%PUBLIC_URL%%/favicon.ico" /^> >> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1" /^> >> index.html
echo     ^<meta name="theme-color" content="#000000" /^> >> index.html
echo     ^<link rel="preconnect" href="https://fonts.googleapis.com"^> >> index.html
echo     ^<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin^> >> index.html
echo     ^<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap" rel="stylesheet"^> >> index.html
echo     ^<meta name="description" content="Galileosky Parser Windows Application" /^> >> index.html
echo     ^<link rel="apple-touch-icon" href="%%PUBLIC_URL%%/logo192.png" /^> >> index.html
echo     ^<link rel="manifest" href="%%PUBLIC_URL%%/manifest.json" /^> >> index.html
echo     ^<title^>Galileosky Parser^</title^> >> index.html
echo   ^</head^> >> index.html
echo   ^<body^> >> index.html
echo     ^<noscript^>You need to enable JavaScript to run this app.^</noscript^> >> index.html
echo     ^<div id="root"^>^</div^> >> index.html
echo   ^</body^> >> index.html
echo ^</html^> >> index.html

echo [OK] index.html created successfully!

:: Also create manifest.json if it doesn't exist
if not exist "manifest.json" (
    echo [INFO] Creating manifest.json...
    echo { > manifest.json
    echo   "short_name": "Galileosky Parser", >> manifest.json
    echo   "name": "Galileosky Parser Windows Application", >> manifest.json
    echo   "icons": [ >> manifest.json
    echo     { >> manifest.json
    echo       "src": "favicon.ico", >> manifest.json
    echo       "sizes": "64x64 32x32 24x24 16x16", >> manifest.json
    echo       "type": "image/x-icon" >> manifest.json
    echo     } >> manifest.json
    echo   ], >> manifest.json
    echo   "start_url": ".", >> manifest.json
    echo   "display": "standalone", >> manifest.json
    echo   "theme_color": "#000000", >> manifest.json
    echo   "background_color": "#ffffff" >> manifest.json
    echo } >> manifest.json
    echo [OK] manifest.json created successfully!
)

echo.
echo ========================================
echo Files Created Successfully!
echo ========================================
echo.
echo You can now build the frontend:
echo cd .. && npm run build
echo.
pause 