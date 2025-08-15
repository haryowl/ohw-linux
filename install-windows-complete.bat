@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Galileosky Parser - Complete Windows Installer
echo ========================================
echo.
echo This installer will set up the complete application
echo Installation directory: %%USERPROFILE%%\GalileoskyParser
echo.
echo Press any key to continue...
pause >nul

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running with administrator privileges
) else (
    echo [WARNING] Not running as administrator. Some features may not work properly.
    echo Please run this installer as administrator for best results.
    pause
)

:: Set variables
set "PROJECT_DIR=%USERPROFILE%\GalileoskyParser"
set "GITHUB_REPO=https://github.com/haryowl/WindowsGS"
set "NODE_VERSION=20.10.0"
set "GIT_VERSION=2.50.1"

echo [INFO] Installation directory: %PROJECT_DIR%
echo [INFO] GitHub repository: %GITHUB_REPO%
echo.

:: Step 1: Check and install Node.js
echo [STEP 1/8] Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Node.js is already installed
    for /f "tokens=*" %%i in ('node --version') do set "CURRENT_NODE=%%i"
    echo [INFO] Current Node.js version: !CURRENT_NODE!
) else (
    echo [INFO] Node.js not found. Installing Node.js...
    
    echo [INFO] Downloading Node.js installer...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-x64.msi' -OutFile '%TEMP%\nodejs-installer.msi'}"
    
    if exist "%TEMP%\nodejs-installer.msi" (
        echo [INFO] Installing Node.js...
        msiexec /i "%TEMP%\nodejs-installer.msi" /quiet /norestart
        timeout /t 10 /nobreak >nul
        
        :: Refresh environment variables
        set "PATH=%PATH%;%PROGRAMFILES%\nodejs"
        
        echo [OK] Node.js installation completed
    ) else (
        echo [ERROR] Failed to download Node.js installer
        echo Please download and install Node.js manually from https://nodejs.org/
        pause
        exit /b 1
    )
)

:: Step 2: Check and install Git
echo [STEP 2/8] Checking Git installation...
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Git is already installed
    for /f "tokens=*" %%i in ('git --version') do set "CURRENT_GIT=%%i"
    echo [INFO] Current Git version: !CURRENT_GIT!
) else (
    echo [INFO] Git not found. Installing Git...
    
    echo [INFO] Downloading Git installer...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v%GIT_VERSION%.windows.1/Git-%GIT_VERSION%-64-bit.exe' -OutFile '%TEMP%\git-installer.exe'}"
    
    if exist "%TEMP%\git-installer.exe" (
        echo [INFO] Installing Git...
        "%TEMP%\git-installer.exe" /VERYSILENT /NORESTART
        timeout /t 15 /nobreak >nul
        
        :: Refresh environment variables
        set "PATH=%PATH%;%PROGRAMFILES%\Git\bin"
        
        echo [OK] Git installation completed
    ) else (
        echo [ERROR] Failed to download Git installer
        echo Please download and install Git manually from https://git-scm.com/
        pause
        exit /b 1
    )
)

:: Step 3: Create project directory and clone repository
echo [STEP 3/8] Setting up project directory...
if not exist "%PROJECT_DIR%" (
    mkdir "%PROJECT_DIR%"
    echo [OK] Project directory created: %PROJECT_DIR%
) else (
    echo [INFO] Project directory already exists: %PROJECT_DIR%
)

echo [INFO] Cloning repository from GitHub...
cd /d "%PROJECT_DIR%"
if exist "WindowsGS" (
    echo [INFO] Repository already exists. Updating...
    cd WindowsGS
    git pull origin main
) else (
    git clone %GITHUB_REPO%.git
    cd WindowsGS
)

if %errorLevel% == 0 (
    echo [OK] Repository cloned/updated successfully
) else (
    echo [ERROR] Failed to clone repository
    pause
    exit /b 1
)

:: Step 4: Install all dependencies
echo [STEP 4/8] Installing project dependencies...

echo [INFO] Installing root dependencies...
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Root dependencies installation failed
    echo [INFO] Retrying with cache clean...
    call npm cache clean --force
    call npm install
)

echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Backend dependencies installation failed
    echo [INFO] Retrying with cache clean...
    call npm cache clean --force
    call npm install
)

echo [INFO] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Frontend dependencies installation failed
    echo [INFO] Retrying with cache clean...
    call npm cache clean --force
    call npm install
)

echo [INFO] Installing mobile frontend dependencies...
cd ..\mobile-frontend
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Mobile frontend dependencies installation failed
    echo [INFO] Retrying with cache clean...
    call npm cache clean --force
    call npm install
)

cd ..

:: Step 5: Configure environment
echo [STEP 5/8] Configuring environment...
cd backend
call node deploy-config.js development

cd ..\frontend
call node deploy-config.js development

cd ..

:: Step 6: Initialize database and create admin user
echo [STEP 6/8] Setting up database and admin user...
cd backend

echo [INFO] Initializing database schema...
call node init-database.js
if %errorLevel% neq 0 (
    echo [ERROR] Database initialization failed
    exit /b 1
)

echo [INFO] Creating admin user...
call node create-default-admin.js

cd ..

:: Step 7: Fix ESLint warnings and build frontend
echo [STEP 7/8] Fixing ESLint warnings and building frontend application...
cd frontend

echo [INFO] Fixing ESLint warnings...
cd ..
call node fix-eslint-warnings.js
cd frontend

echo [INFO] Building frontend application...
call npm run build
if %errorLevel% neq 0 (
    echo [ERROR] Frontend build failed
    echo [INFO] Checking for missing files...
    
    if not exist "public\index.html" (
        echo [INFO] Creating missing index.html...
        echo ^<!DOCTYPE html^> > "public\index.html"
        echo ^<html lang="en"^> >> "public\index.html"
        echo   ^<head^> >> "public\index.html"
        echo     ^<meta charset="utf-8" /^> >> "public\index.html"
        echo     ^<link rel="icon" href="%%PUBLIC_URL%%/favicon.ico" /^> >> "public\index.html"
        echo     ^<meta name="viewport" content="width=device-width, initial-scale=1" /^> >> "public\index.html"
        echo     ^<meta name="theme-color" content="#000000" /^> >> "public\index.html"
        echo     ^<meta name="description" content="Galileosky Parser Windows Application" /^> >> "public\index.html"
        echo     ^<title^>Galileosky Parser^</title^> >> "public\index.html"
        echo   ^</head^> >> "public\index.html"
        echo   ^<body^> >> "public\index.html"
        echo     ^<noscript^>You need to enable JavaScript to run this app.^</noscript^> >> "public\index.html"
        echo     ^<div id="root"^>^</div^> >> "public\index.html"
        echo   ^</body^> >> "public\index.html"
        echo ^</html^> >> "public\index.html"
    )
    
    echo [INFO] Retrying build...
    call npm run build
)

cd ..

:: Step 8: Create shortcuts and documentation
echo [STEP 8/8] Creating shortcuts and documentation...

:: Create desktop shortcut
echo [INFO] Creating desktop shortcut...
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\Galileosky Parser.lnk"

powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/k cd /d \"%PROJECT_DIR%\WindowsGS\" ^&^& echo Starting Galileosky Parser... ^&^& cd backend ^&^& npm start'; $Shortcut.WorkingDirectory = '%PROJECT_DIR%\WindowsGS'; $Shortcut.Description = 'Galileosky Parser Windows Application'; $Shortcut.Save()}"

:: Create start menu shortcut
echo [INFO] Creating start menu shortcut...
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
set "START_SHORTCUT=%START_MENU%\Galileosky Parser.lnk"

powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_SHORTCUT%'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/k cd /d \"%PROJECT_DIR%\WindowsGS\" ^&^& echo Starting Galileosky Parser... ^&^& cd backend ^&^& npm start'; $Shortcut.WorkingDirectory = '%PROJECT_DIR%\WindowsGS'; $Shortcut.Description = 'Galileosky Parser Windows Application'; $Shortcut.Save()}"

:: Create uninstaller
echo [INFO] Creating uninstaller...
set "UNINSTALLER=%PROJECT_DIR%\uninstall.bat"

echo @echo off > "%UNINSTALLER%"
echo echo Uninstalling Galileosky Parser... >> "%UNINSTALLER%"
echo echo. >> "%UNINSTALLER%"
echo echo Removing project files... >> "%UNINSTALLER%"
echo rmdir /s /q "%PROJECT_DIR%" >> "%UNINSTALLER%"
echo echo. >> "%UNINSTALLER%"
echo echo Removing shortcuts... >> "%UNINSTALLER%"
echo del "%DESKTOP%\Galileosky Parser.lnk" 2^>nul >> "%UNINSTALLER%"
echo del "%START_MENU%\Galileosky Parser.lnk" 2^>nul >> "%UNINSTALLER%"
echo echo. >> "%UNINSTALLER%"
echo echo Uninstallation completed. >> "%UNINSTALLER%"
echo pause >> "%UNINSTALLER%"

:: Create README for user
echo [INFO] Creating user documentation...
set "USER_README=%PROJECT_DIR%\README.txt"

echo Galileosky Parser Windows Application > "%USER_README%"
echo ====================================== >> "%USER_README%"
echo. >> "%USER_README%"
echo Installation completed successfully! >> "%USER_README%"
echo. >> "%USER_README%"
echo Project Location: %PROJECT_DIR%\WindowsGS >> "%USER_README%"
echo. >> "%USER_README%"
echo How to Start: >> "%USER_README%"
echo 1. Double-click the desktop shortcut "Galileosky Parser" >> "%USER_README%"
echo 2. Or navigate to the project folder and run: cd backend ^&^& npm start >> "%USER_README%"
echo. >> "%USER_README%"
echo Access Points: >> "%USER_README%"
echo - Web Dashboard: http://localhost:3002 >> "%USER_README%"
echo - Mobile Interface: http://localhost:3004 >> "%USER_README%"
echo - Backend API: http://localhost:3001 >> "%USER_README%"
echo. >> "%USER_README%"
echo Default Login: >> "%USER_README%"
echo - Username: admin >> "%USER_README%"
echo - Password: admin123 >> "%USER_README%"
echo. >> "%USER_README%"
echo To uninstall: Run uninstall.bat in the project folder >> "%USER_README%"
echo. >> "%USER_README%"
echo For support: https://github.com/haryowl/WindowsGS/issues >> "%USER_README%"

:: Final success message
echo.
echo ========================================
echo Installation Completed Successfully!
echo ========================================
echo.
echo Project installed at: %PROJECT_DIR%\WindowsGS
echo.
echo Desktop shortcut created: Galileosky Parser
echo Start menu shortcut created: Galileosky Parser
echo.
echo To start the application:
echo 1. Double-click the desktop shortcut, OR
echo 2. Open Command Prompt and run:
echo    cd "%PROJECT_DIR%\WindowsGS\backend"
echo    npm start
echo.
echo Access the application at:
echo - Web Dashboard: http://localhost:3002
echo - Mobile Interface: http://localhost:3004
echo.
echo Default login credentials:
echo - Username: admin
echo - Password: admin123
echo.
echo Documentation: %PROJECT_DIR%\README.txt
echo.
echo Installation completed! The application is ready to use.
echo.
pause 