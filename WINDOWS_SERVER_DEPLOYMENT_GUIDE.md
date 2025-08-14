# Windows Server Deployment Guide - Galileosky Parser

This guide provides step-by-step instructions for deploying the Galileosky Parser project to a Windows Server from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Install Node.js and npm](#install-nodejs-and-npm)
4. [Install PM2](#install-pm2)
5. [Clone/Download Project](#clone-download-project)
6. [Install Dependencies](#install-dependencies)
7. [Database Setup](#database-setup)
8. [Configuration](#configuration)
9. [Build Frontend](#build-frontend)
10. [Start Services](#start-services)
11. [Configure Windows Firewall](#configure-windows-firewall)
12. [Setup Windows Service](#setup-windows-service)
13. [Monitoring and Maintenance](#monitoring-and-maintenance)
14. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **OS**: Windows Server 2016/2019/2022
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Static IP address
- **Ports**: 3001 (Backend), 3002 (Frontend), 3003 (TCP Parser)

### Software Requirements
- Node.js 18.x or higher
- npm (comes with Node.js)
- Git (optional, for cloning)

## Server Setup

### 1. Update Windows Server
```powershell
# Run Windows Update
sconfig
# Or use PowerShell
Install-Module PSWindowsUpdate -Force
Get-WindowsUpdate -Install -AcceptAll
```

### 2. Enable Required Windows Features
```powershell
# Enable .NET Framework 3.5 and 4.8
Enable-WindowsOptionalFeature -Online -FeatureName NetFx3
Enable-WindowsOptionalFeature -Online -FeatureName NetFx4Extended-ASPNET45

# Enable IIS (optional, for reverse proxy)
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent
```

## Install Node.js and npm

### Method 1: Using Node.js Installer (Recommended)
1. Download Node.js from https://nodejs.org/
2. Choose LTS version (18.x or higher)
3. Run the installer as Administrator
4. Follow the installation wizard
5. Verify installation:
```powershell
node --version
npm --version
```

### Method 2: Using Chocolatey
```powershell
# Install Chocolatey first (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs -y
```

### Method 3: Using winget
```powershell
winget install OpenJS.NodeJS
```

## Install PM2

PM2 is used for process management and will keep your applications running.

```powershell
# Install PM2 globally
npm install -g pm2

# Install PM2 Windows Service
pm2 install pm2-windows-service

# Verify installation
pm2 --version
```

## Clone/Download Project

### Method 1: Using Git
```powershell
# Navigate to desired directory
cd C:\
mkdir Projects
cd Projects

# Clone the repository
git clone <your-repository-url> gali-parse
cd gali-parse
```

### Method 2: Manual Download
1. Download the project ZIP file
2. Extract to `C:\Projects\gali-parse`
3. Open PowerShell and navigate to the project:
```powershell
cd C:\Projects\gali-parse
```

## Install Dependencies

### 1. Install Root Dependencies
```powershell
# Navigate to project root
cd C:\Projects\gali-parse

# Install dependencies
npm install
```

### 2. Install Backend Dependencies
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Return to root
cd ..
```

### 3. Install Frontend Dependencies
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Return to root
cd ..
```

## Database Setup

The project uses SQLite by default, which is included with the project.

### 1. Create Database Directory
```powershell
# Create data directory
mkdir C:\Projects\gali-parse\backend\data
```

### 2. Run Database Migrations
```powershell
# Navigate to backend
cd C:\Projects\gali-parse\backend

# Run migrations
npm run migrate

# Or run manually
node scripts/migrate.js
```

### 3. Create Default Admin User
```powershell
# Create admin user
node create-default-admin.js
```

## Configuration

### 1. Backend Configuration
Create or update `backend/src/config/production.js`:

```javascript
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
    secret: 'your-super-secret-jwt-key-change-this',
    expiresIn: '24h'
  },
  cors: {
    origin: ['http://localhost:3002', 'http://your-server-ip:3002'],
    credentials: true
  }
};
```

### 2. Frontend Configuration
Update `frontend/src/services/api.js` to point to your server:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://your-server-ip:3001';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://your-server-ip:3001/ws';
```

### 3. Environment Variables
Create `.env` file in backend directory:

```env
NODE_ENV=production
PORT=3001
HTTP_PORT=3001
WS_PORT=3001
TCP_PORT=3003
JWT_SECRET=your-super-secret-jwt-key-change-this
```

## Build Frontend

### 1. Build Production Version
```powershell
# Navigate to frontend
cd C:\Projects\gali-parse\frontend

# Build the application
npm run build
```

### 2. Verify Build
Check that the `build` folder was created and contains:
- `index.html`
- `static/` folder with CSS and JS files

## Start Services

### 1. Using PM2 (Recommended)
```powershell
# Navigate to project root
cd C:\Projects\gali-parse

# Start all services using ecosystem config
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs
```

### 2. Manual Start (Alternative)
```powershell
# Start backend
cd backend
npm start

# In another terminal, start frontend
cd frontend
npm start
```

### 3. Verify Services
- Backend: http://your-server-ip:3001
- Frontend: http://your-server-ip:3002
- TCP Parser: Port 3003

## Configure Windows Firewall

### 1. Open Required Ports
```powershell
# Open port 3001 (Backend)
New-NetFirewallRule -DisplayName "Galileosky Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow

# Open port 3002 (Frontend)
New-NetFirewallRule -DisplayName "Galileosky Frontend" -Direction Inbound -Protocol TCP -LocalPort 3002 -Action Allow

# Open port 3003 (TCP Parser)
New-NetFirewallRule -DisplayName "Galileosky TCP Parser" -Direction Inbound -Protocol TCP -LocalPort 3003 -Action Allow
```

### 2. Alternative: Using Windows Firewall GUI
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Select "Inbound Rules" → "New Rule"
4. Add rules for ports 3001, 3002, and 3003

## Setup Windows Service

### 1. Install PM2 as Windows Service
```powershell
# Install PM2 Windows Service
pm2 install pm2-windows-service

# Set PM2 to start on boot
pm2 startup

# Save current PM2 configuration
pm2 save
```

### 2. Verify Service Installation
```powershell
# Check if service is installed
Get-Service | Where-Object {$_.Name -like "*PM2*"}

# Start the service
Start-Service PM2
```

## Monitoring and Maintenance

### 1. PM2 Commands
```powershell
# Check status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Delete services
pm2 delete all
```

### 2. Log Management
```powershell
# View backend logs
pm2 logs galileosky-backend

# View frontend logs
pm2 logs galileosky-frontend

# Clear logs
pm2 flush
```

### 3. Database Backup
```powershell
# Navigate to backend
cd C:\Projects\gali-parse\backend

# Run backup script
node scripts/backup.js
```

### 4. Update Application
```powershell
# Stop services
pm2 stop all

# Pull latest code (if using git)
git pull

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Build frontend
cd frontend && npm run build && cd ..

# Start services
pm2 start ecosystem.config.js
pm2 save
```

## Troubleshooting

### 1. Port Already in Use
```powershell
# Check what's using the port
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F
```

### 2. Permission Issues
```powershell
# Run PowerShell as Administrator
# Or grant permissions to the application folder
icacls "C:\Projects\gali-parse" /grant "Everyone:(OI)(CI)F"
```

### 3. Node.js Memory Issues
```powershell
# Increase Node.js memory limit
set NODE_OPTIONS=--max-old-space-size=4096
```

### 4. PM2 Issues
```powershell
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

### 5. Database Issues
```powershell
# Check database file
dir C:\Projects\gali-parse\backend\data

# Recreate database (WARNING: This will delete all data)
Remove-Item C:\Projects\gali-parse\backend\data\database.sqlite
npm run migrate
node create-default-admin.js
```

### 6. Frontend Build Issues
```powershell
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## Security Considerations

### 1. Change Default Passwords
- Update JWT secret in configuration
- Change default admin password
- Use strong passwords for all accounts

### 2. Network Security
- Configure firewall rules properly
- Use HTTPS in production
- Consider using a reverse proxy (IIS/Nginx)

### 3. File Permissions
- Restrict access to sensitive files
- Use service accounts with minimal privileges
- Regular security updates

## Performance Optimization

### 1. Memory Management
```powershell
# Monitor memory usage
pm2 monit

# Set memory limits in ecosystem.config.js
max_memory_restart: '2G'
```

### 2. Database Optimization
- Regular database maintenance
- Monitor database size
- Implement data archiving if needed

### 3. Log Rotation
```powershell
# Configure log rotation in ecosystem.config.js
log_file: './logs/combined.log',
out_file: './logs/out.log',
error_file: './logs/error.log'
```

## Backup and Recovery

### 1. Regular Backups
```powershell
# Create backup script
$backupPath = "C:\Backups\gali-parse"
$date = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupFile = "$backupPath\backup-$date.zip"

# Backup database and configuration
Compress-Archive -Path "C:\Projects\gali-parse\backend\data" -DestinationPath $backupFile
```

### 2. Recovery Procedure
```powershell
# Stop services
pm2 stop all

# Restore from backup
Expand-Archive -Path "C:\Backups\gali-parse\backup-YYYY-MM-DD-HHMMSS.zip" -DestinationPath "C:\Projects\gali-parse\backend\data"

# Start services
pm2 start ecosystem.config.js
```

## Support and Maintenance

### 1. Regular Maintenance Tasks
- Monitor system resources
- Check application logs
- Update dependencies
- Backup database
- Review security settings

### 2. Monitoring Tools
- PM2 monitoring
- Windows Event Viewer
- Performance Monitor
- Custom monitoring scripts

### 3. Documentation
- Keep deployment documentation updated
- Document any custom configurations
- Maintain troubleshooting guides
- Record any issues and solutions

---

## Quick Start Checklist

- [ ] Install Node.js 18+
- [ ] Install PM2 globally
- [ ] Clone/download project
- [ ] Install all dependencies
- [ ] Configure environment
- [ ] Run database migrations
- [ ] Create admin user
- [ ] Build frontend
- [ ] Configure firewall
- [ ] Start services with PM2
- [ ] Test all endpoints
- [ ] Setup Windows service
- [ ] Configure backups
- [ ] Document deployment

---

**Note**: This guide assumes a basic Windows Server setup. Adjust configurations based on your specific environment and security requirements. 