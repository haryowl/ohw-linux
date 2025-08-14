# Galileosky Parser Windows Installer (PowerShell)
# Run this script as Administrator for best results

param(
    [switch]$Silent,
    [string]$InstallPath = "$env:USERPROFILE\GalileoskyParser"
)

# Set execution policy to allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Galileosky Parser Windows Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if ($isAdmin) {
    Write-Host "[INFO] Running with administrator privileges" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Not running as administrator. Some features may not work properly." -ForegroundColor Yellow
    Write-Host "Please run this installer as administrator for best results." -ForegroundColor Yellow
    if (-not $Silent) {
        Read-Host "Press Enter to continue anyway"
    }
}

# Set variables
$GITHUB_REPO = "https://github.com/haryowl/WindowsGS"
$NODE_VERSION = "20.10.0"
$GIT_VERSION = "2.50.1"

Write-Host "[INFO] Installation directory: $InstallPath" -ForegroundColor Blue
Write-Host "[INFO] GitHub repository: $GITHUB_REPO" -ForegroundColor Blue
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check if Node.js is installed
Write-Host "[INFO] Checking Node.js installation..." -ForegroundColor Blue
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js is already installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[INFO] Node.js not found. Installing Node.js..." -ForegroundColor Yellow
    
    # Download Node.js installer
    Write-Host "[INFO] Downloading Node.js installer..." -ForegroundColor Blue
    $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
    $nodeUrl = "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-x64.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
        Write-Host "[INFO] Installing Node.js..." -ForegroundColor Blue
        Start-Process msiexec.exe -Wait -ArgumentList "/i `"$nodeInstaller`"", "/quiet", "/norestart"
        Start-Sleep -Seconds 10
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Host "[OK] Node.js installation completed" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to install Node.js: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please download and install Node.js manually from https://nodejs.org/" -ForegroundColor Yellow
        if (-not $Silent) { Read-Host "Press Enter to exit" }
        exit 1
    }
}

# Check if Git is installed
Write-Host "[INFO] Checking Git installation..." -ForegroundColor Blue
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Host "[OK] Git is already installed: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "[INFO] Git not found. Installing Git..." -ForegroundColor Yellow
    
    # Download Git installer
    Write-Host "[INFO] Downloading Git installer..." -ForegroundColor Blue
    $gitInstaller = "$env:TEMP\git-installer.exe"
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v$GIT_VERSION.windows.1/Git-$GIT_VERSION-64-bit.exe"
    
    try {
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller
        Write-Host "[INFO] Installing Git..." -ForegroundColor Blue
        Start-Process $gitInstaller -Wait -ArgumentList "/VERYSILENT", "/NORESTART"
        Start-Sleep -Seconds 15
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Host "[OK] Git installation completed" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to install Git: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please download and install Git manually from https://git-scm.com/" -ForegroundColor Yellow
        if (-not $Silent) { Read-Host "Press Enter to exit" }
        exit 1
    }
}

# Create project directory
Write-Host "[INFO] Creating project directory..." -ForegroundColor Blue
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Host "[OK] Project directory created: $InstallPath" -ForegroundColor Green
} else {
    Write-Host "[INFO] Project directory already exists: $InstallPath" -ForegroundColor Blue
}

# Clone repository
Write-Host "[INFO] Cloning repository from GitHub..." -ForegroundColor Blue
$projectDir = Join-Path $InstallPath "WindowsGS"

if (Test-Path $projectDir) {
    Write-Host "[INFO] Repository already exists. Updating..." -ForegroundColor Blue
    Set-Location $projectDir
    git pull origin main
} else {
    Set-Location $InstallPath
    git clone "$GITHUB_REPO.git"
    Set-Location $projectDir
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Repository cloned/updated successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to clone repository" -ForegroundColor Red
    if (-not $Silent) { Read-Host "Press Enter to exit" }
    exit 1
}

# Install dependencies
Write-Host "[INFO] Installing project dependencies..." -ForegroundColor Blue

Write-Host "[INFO] Installing root dependencies..." -ForegroundColor Blue
npm install

Write-Host "[INFO] Installing backend dependencies..." -ForegroundColor Blue
Set-Location "backend"
npm install

Write-Host "[INFO] Installing frontend dependencies..." -ForegroundColor Blue
Set-Location "..\frontend"
npm install

Write-Host "[INFO] Installing mobile frontend dependencies..." -ForegroundColor Blue
Set-Location "..\mobile-frontend"
npm install

Set-Location $projectDir

# Configure environment
Write-Host "[INFO] Configuring environment..." -ForegroundColor Blue
Set-Location "backend"
node deploy-config.js development

Set-Location "..\frontend"
node deploy-config.js development

Set-Location $projectDir

# Create admin user
Write-Host "[INFO] Setting up admin user..." -ForegroundColor Blue
Set-Location "backend"
node create-default-admin.js

Set-Location $projectDir

# Build frontend
Write-Host "[INFO] Building frontend application..." -ForegroundColor Blue
Set-Location "frontend"
npm run build

Set-Location $projectDir

# Create desktop shortcut
Write-Host "[INFO] Creating desktop shortcut..." -ForegroundColor Blue
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Galileosky Parser.lnk"

$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/k `"cd /d `"$projectDir`" && echo Starting Galileosky Parser... && cd backend && npm start`""
$Shortcut.WorkingDirectory = $projectDir
$Shortcut.Description = "Galileosky Parser Windows Application"
$Shortcut.IconLocation = Join-Path $projectDir "frontend\build\static\favicon.ico"
$Shortcut.Save()

# Create start menu shortcut
Write-Host "[INFO] Creating start menu shortcut..." -ForegroundColor Blue
$startMenu = [Environment]::GetFolderPath("StartMenu")
$startShortcutPath = Join-Path $startMenu "Programs\Galileosky Parser.lnk"

$StartShortcut = $WshShell.CreateShortcut($startShortcutPath)
$StartShortcut.TargetPath = "cmd.exe"
$StartShortcut.Arguments = "/k `"cd /d `"$projectDir`" && echo Starting Galileosky Parser... && cd backend && npm start`""
$StartShortcut.WorkingDirectory = $projectDir
$StartShortcut.Description = "Galileosky Parser Windows Application"
$StartShortcut.IconLocation = Join-Path $projectDir "frontend\build\static\favicon.ico"
$StartShortcut.Save()

# Create uninstaller
Write-Host "[INFO] Creating uninstaller..." -ForegroundColor Blue
$uninstallerPath = Join-Path $InstallPath "uninstall.ps1"

$uninstallerContent = @"
# Galileosky Parser Uninstaller
Write-Host "Uninstalling Galileosky Parser..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Removing project files..." -ForegroundColor Blue
Remove-Item -Path "$InstallPath" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Removing shortcuts..." -ForegroundColor Blue
Remove-Item -Path "$shortcutPath" -ErrorAction SilentlyContinue
Remove-Item -Path "$startShortcutPath" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Uninstallation completed." -ForegroundColor Green
Read-Host "Press Enter to exit"
"@

$uninstallerContent | Out-File -FilePath $uninstallerPath -Encoding UTF8

# Create README for user
Write-Host "[INFO] Creating user documentation..." -ForegroundColor Blue
$userReadmePath = Join-Path $InstallPath "README.txt"

$readmeContent = @"
Galileosky Parser Windows Application
======================================

Installation completed successfully!

Project Location: $projectDir

How to Start:
1. Double-click the desktop shortcut "Galileosky Parser"
2. Or navigate to the project folder and run: cd backend && npm start

Access Points:
- Web Dashboard: http://localhost:3002
- Mobile Interface: http://localhost:3004
- Backend API: http://localhost:3001

Default Login:
- Username: admin
- Password: admin123

To uninstall: Run uninstall.ps1 in the project folder

For support: https://github.com/haryowl/WindowsGS/issues
"@

$readmeContent | Out-File -FilePath $userReadmePath -Encoding UTF8

# Final success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Project installed at: $projectDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Desktop shortcut created: Galileosky Parser" -ForegroundColor Cyan
Write-Host "Start menu shortcut created: Galileosky Parser" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host "1. Double-click the desktop shortcut, OR" -ForegroundColor White
Write-Host "2. Open Command Prompt and run:" -ForegroundColor White
Write-Host "   cd `"$projectDir\backend`"" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Yellow
Write-Host "- Web Dashboard: http://localhost:3002" -ForegroundColor White
Write-Host "- Mobile Interface: http://localhost:3004" -ForegroundColor White
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Yellow
Write-Host "- Username: admin" -ForegroundColor White
Write-Host "- Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: $userReadmePath" -ForegroundColor Cyan
Write-Host ""

if (-not $Silent) {
    Read-Host "Press Enter to exit"
} 