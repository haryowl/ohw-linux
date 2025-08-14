@echo off
echo 🚀 Starting Gali Parse Mobile Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the mobile-frontend directory.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if backend is running (optional)
echo 🔍 Checking backend connection...
curl -s http://localhost:3001/api/auth/check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 3001
) else (
    echo ⚠️  Backend not detected on port 3001. Make sure the backend is running.
    echo    You can still start the frontend, but API calls will fail.
)

REM Start the development server
echo 🌐 Starting development server...
echo 📱 Mobile frontend will be available at: http://localhost:3000
echo 📱 For mobile testing, use your device's IP address or ngrok
echo.
echo Press Ctrl+C to stop the server
echo.

npm start 