# Windows Server Deployment Script for Galileosky Parser
# Run this script as Administrator

param(
    [string]$ProjectPath = "C:\Projects\gali-parse",
    [string]$ServerIP = "localhost",
    [string]$JWTSecret = "your-super-secret-jwt-key-change-this-in-production"
)

Write-Host "=== Galileosky Parser Windows Server Deployment ===" -ForegroundColor Green
Write-Host "This script will deploy the Galileosky Parser to Windows Server" -ForegroundColor Yellow
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to install Chocolatey
function Install-Chocolatey {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Function to install Node.js
function Install-NodeJS {
    Write-Host "Installing Node.js..." -ForegroundColor Yellow
    if (Test-Command "choco") {
        choco install nodejs -y
    } else {
        Write-Host "Chocolatey not found. Please install Node.js manually from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
}

# Function to install PM2
function Install-PM2 {
    Write-Host "Installing PM2..." -ForegroundColor Yellow
    npm install -g pm2
    pm2 install pm2-windows-service
}

# Function to create project directory
function Create-ProjectDirectory {
    Write-Host "Creating project directory..." -ForegroundColor Yellow
    if (!(Test-Path $ProjectPath)) {
        New-Item -ItemType Directory -Path $ProjectPath -Force
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "Installing project dependencies..." -ForegroundColor Yellow
    
    # Root dependencies
    Set-Location $ProjectPath
    npm install
    
    # Backend dependencies
    Set-Location "$ProjectPath\backend"
    npm install
    
    # Frontend dependencies
    Set-Location "$ProjectPath\frontend"
    npm install
    
    Set-Location $ProjectPath
}

# Function to setup database
function Setup-Database {
    Write-Host "Setting up database..." -ForegroundColor Yellow
    
    # Create data directory
    $dataPath = "$ProjectPath\backend\data"
    if (!(Test-Path $dataPath)) {
        New-Item -ItemType Directory -Path $dataPath -Force
    }
    
    # Run migrations
    Set-Location "$ProjectPath\backend"
    try {
        npm run migrate
        Write-Host "Database migrations completed successfully" -ForegroundColor Green
    } catch {
        Write-Host "Error running migrations: $_" -ForegroundColor Red
    }
    
    # Create admin user
    try {
        Set-Location $ProjectPath
        node create-default-admin.js
        Write-Host "Admin user created successfully" -ForegroundColor Green
    } catch {
        Write-Host "Error creating admin user: $_" -ForegroundColor Red
    }
    
    Set-Location $ProjectPath
}

# Function to create configuration files
function Create-Configuration {
    Write-Host "Creating configuration files..." -ForegroundColor Yellow
    
    # Create backend .env file
    $envContent = @"
NODE_ENV=production
PORT=3001
HTTP_PORT=3001
WS_PORT=3001
TCP_PORT=3003
JWT_SECRET=$JWTSecret
"@
    
    $envPath = "$ProjectPath\backend\.env"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    
    # Create production config
    $prodConfigContent = @"
module.exports = {
  database: {
    dialect: 'sqlite',
    storage: './data/database.sqlite',
    logging: false
  },
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  websocket: {
    port: 3001
  },
  tcp: {
    port: 3003
  },
  jwt: {
    secret: '$JWTSecret',
    expiresIn: '24h'
  },
  cors: {
    origin: ['http://localhost:3002', 'http://$ServerIP:3002'],
    credentials: true
  }
};
"@
    
    $prodConfigPath = "$ProjectPath\backend\src\config\production.js"
    $prodConfigContent | Out-File -FilePath $prodConfigPath -Encoding UTF8
    
    Write-Host "Configuration files created successfully" -ForegroundColor Green
}

# Function to build frontend
function Build-Frontend {
    Write-Host "Building frontend..." -ForegroundColor Yellow
    
    Set-Location "$ProjectPath\frontend"
    try {
        npm run build
        Write-Host "Frontend built successfully" -ForegroundColor Green
    } catch {
        Write-Host "Error building frontend: $_" -ForegroundColor Red
    }
    
    Set-Location $ProjectPath
}

# Function to configure firewall
function Configure-Firewall {
    Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
    
    # Remove existing rules if they exist
    Remove-NetFirewallRule -DisplayName "Galileosky Backend" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "Galileosky Frontend" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "Galileosky TCP Parser" -ErrorAction SilentlyContinue
    
    # Create new rules
    New-NetFirewallRule -DisplayName "Galileosky Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
    New-NetFirewallRule -DisplayName "Galileosky Frontend" -Direction Inbound -Protocol TCP -LocalPort 3002 -Action Allow
    New-NetFirewallRule -DisplayName "Galileosky TCP Parser" -Direction Inbound -Protocol TCP -LocalPort 3003 -Action Allow
    
    Write-Host "Firewall rules configured successfully" -ForegroundColor Green
}

# Function to start services
function Start-Services {
    Write-Host "Starting services with PM2..." -ForegroundColor Yellow
    
    Set-Location $ProjectPath
    
    # Stop any existing services
    pm2 stop all -s
    pm2 delete all -s
    
    # Start services
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot (Windows specific)
    try {
        pm2 install pm2-windows-service
        pm2 startup
        Write-Host "PM2 Windows service configured successfully" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not configure PM2 Windows service. You may need to run 'pm2 startup' manually." -ForegroundColor Yellow
    }
    
    Write-Host "Services started successfully" -ForegroundColor Green
}

# Function to create logs directory
function Create-LogsDirectory {
    Write-Host "Creating logs directory..." -ForegroundColor Yellow
    
    $logsPath = "$ProjectPath\logs"
    if (!(Test-Path $logsPath)) {
        New-Item -ItemType Directory -Path $logsPath -Force
    }
}

# Main deployment process
try {
    Write-Host "Starting deployment process..." -ForegroundColor Green
    
    # Check if Node.js is installed
    if (!(Test-Command "node")) {
        Write-Host "Node.js not found. Installing..." -ForegroundColor Yellow
        if (!(Test-Command "choco")) {
            Install-Chocolatey
        }
        Install-NodeJS
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    
    # Check Node.js version
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Install PM2 if not installed
    if (!(Test-Command "pm2")) {
        Install-PM2
    }
    
    # Create project directory
    Create-ProjectDirectory
    
    # Create logs directory
    Create-LogsDirectory
    
    # Install dependencies
    Install-Dependencies
    
    # Setup database
    Setup-Database
    
    # Create configuration
    Create-Configuration
    
    # Build frontend
    Build-Frontend
    
    # Configure firewall
    Configure-Firewall
    
    # Start services
    Start-Services
    
    Write-Host ""
    Write-Host "=== Deployment Completed Successfully! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services are now running:" -ForegroundColor Yellow
    Write-Host "- Backend: http://$ServerIP:3001" -ForegroundColor Cyan
    Write-Host "- Frontend: http://$ServerIP:3002" -ForegroundColor Cyan
    Write-Host "- TCP Parser: Port 3003" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Yellow
    Write-Host "- Check status: pm2 status" -ForegroundColor White
    Write-Host "- View logs: pm2 logs" -ForegroundColor White
    Write-Host "- Restart services: pm2 restart all" -ForegroundColor White
    Write-Host "- Stop services: pm2 stop all" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANT: Change the JWT secret in production!" -ForegroundColor Red
    
} catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
    exit 1
} 