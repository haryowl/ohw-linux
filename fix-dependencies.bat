@echo off
echo ========================================
echo Galileosky Parser - Fix Dependencies
echo ========================================
echo.

set "PROJECT_DIR=%USERPROFILE%\GalileoskyParser\WindowsGS"

if not exist "%PROJECT_DIR%" (
    echo [ERROR] Project directory not found: %PROJECT_DIR%
    echo Please run the installer first.
    pause
    exit /b 1
)

echo [INFO] Fixing dependencies in: %PROJECT_DIR%
echo.

cd /d "%PROJECT_DIR%"

echo [INFO] Clearing npm cache...
call npm cache clean --force

echo [INFO] Installing root dependencies...
call npm install

echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Backend installation failed. Retrying...
    call npm cache clean --force
    call npm install
)

echo [INFO] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Frontend installation failed. Retrying...
    call npm cache clean --force
    call npm install
)

echo [INFO] Installing mobile frontend dependencies...
cd ..\mobile-frontend
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Mobile frontend installation failed. Retrying...
    call npm cache clean --force
    call npm install
)

cd ..

echo.
echo ========================================
echo Dependencies Fixed Successfully!
echo ========================================
echo.
echo You can now start the application:
echo cd backend
echo npm start
echo.
pause 