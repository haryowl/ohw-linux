@echo off
echo ========================================
echo Fix Frontend Configuration
echo ========================================
echo.

set "PROJECT_DIR=%USERPROFILE%\GalileoskyParser\WindowsGS"

if not exist "%PROJECT_DIR%" (
    echo [ERROR] Project directory not found: %PROJECT_DIR%
    pause
    exit /b 1
)

echo [INFO] Fixing frontend configuration in: %PROJECT_DIR%
echo.

cd /d "%PROJECT_DIR%"

echo [INFO] Configuring frontend for localhost...
cd frontend
call node deploy-config.js development

echo [INFO] Rebuilding frontend...
call npm run build

echo [INFO] Starting frontend server...
call node start-server.js

echo.
echo ========================================
echo Frontend Configuration Fixed!
echo ========================================
echo.
echo Frontend should now be accessible at:
echo http://localhost:3002
echo.
echo Make sure backend is running on port 3001
echo.
pause 