@echo off
title Galileosky Parser - Starting Application
color 0A

echo ========================================
echo    Galileosky Parser Windows
echo    Starting Application...
echo ========================================
echo.

:: Check if we're in the correct directory
if not exist "backend" (
    echo [ERROR] Backend directory not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] Frontend directory not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

:: Check if dependencies are installed
echo [INFO] Checking dependencies...
if not exist "backend\node_modules" (
    echo [WARNING] Backend dependencies not found. Installing...
    cd backend
    call npm install
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
    cd ..
)

if not exist "frontend\node_modules" (
    echo [WARNING] Frontend dependencies not found. Installing...
    cd frontend
    call npm install
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    cd ..
)

:: Check if frontend is built
if not exist "frontend\build" (
    echo [WARNING] Frontend build not found. Building...
    cd frontend
    call npm run build
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to build frontend!
        pause
        exit /b 1
    )
    cd ..
)

echo [INFO] Dependencies check completed.
echo.

:: Start backend server
echo [INFO] Starting backend server...
echo [INFO] Backend will be available at: http://localhost:3001
echo.

cd backend
start "Galileosky Backend" cmd /k "title Galileosky Backend Server && echo Starting backend server... && npm start"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server
echo [INFO] Starting frontend server...
echo [INFO] Frontend will be available at: http://localhost:3002
echo.

cd ..\frontend
start "Galileosky Frontend" cmd /k "title Galileosky Frontend Server && echo Starting frontend server... && npm start"

cd ..

echo.
echo ========================================
echo    Application Started Successfully!
echo ========================================
echo.
echo [INFO] Backend Server: http://localhost:3001
echo [INFO] Frontend Dashboard: http://localhost:3002
echo [INFO] Mobile Interface: http://localhost:3004
echo.
echo [INFO] Default Login Credentials:
echo       Username: admin
echo       Password: admin123
echo.
echo [INFO] Both servers are starting in separate windows.
echo [INFO] Please wait for the servers to fully load.
echo.
echo [INFO] Press any key to open the application in your browser...
pause >nul

:: Open the application in default browser
echo [INFO] Opening application in browser...
start http://localhost:3002

echo.
echo [INFO] Application opened in browser!
echo [INFO] Keep this window open to monitor the application status.
echo [INFO] Close this window when you want to stop the application.
echo.
echo [INFO] To stop the application, close the backend and frontend windows.
echo.
pause 