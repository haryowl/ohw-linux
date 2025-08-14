@echo off
echo ========================================
echo Fix Missing cookie-parser Module
echo ========================================
echo.

set "PROJECT_DIR=%USERPROFILE%\GalileoskyParser\WindowsGS"

if not exist "%PROJECT_DIR%" (
    echo [ERROR] Project directory not found: %PROJECT_DIR%
    echo Please run the installer first.
    pause
    exit /b 1
)

echo [INFO] Fixing missing cookie-parser module in: %PROJECT_DIR%
echo.

cd /d "%PROJECT_DIR%\backend"

echo [INFO] Installing missing cookie-parser dependency...
call npm install cookie-parser@^1.4.6

if %errorLevel% neq 0 (
    echo [ERROR] Failed to install cookie-parser. Retrying...
    call npm cache clean --force
    call npm install cookie-parser@^1.4.6
)

echo [INFO] Verifying installation...
call npm list cookie-parser

echo.
echo ========================================
echo Fix Completed!
echo ========================================
echo.
echo You can now start the application:
echo cd backend
echo npm start
echo.
pause 