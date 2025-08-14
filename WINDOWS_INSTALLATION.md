# Windows Installation Guide

This guide provides multiple ways to install the Galileosky Parser Windows application on your Windows system.

## 🚀 Quick Installation (Recommended)

### Option 1: Automated Installer (Easiest)

1. **Download the installer**:
   - [Download `install-windows.bat`](https://raw.githubusercontent.com/haryowl/WindowsGS/main/install-windows.bat)
   - [Download `install-windows.ps1`](https://raw.githubusercontent.com/haryowl/WindowsGS/main/install-windows.ps1)

2. **Run the installer**:
   - **For Batch installer**: Right-click `install-windows.bat` → "Run as administrator"
   - **For PowerShell installer**: Right-click `install-windows.ps1` → "Run with PowerShell"

3. **Wait for installation to complete** (5-10 minutes)

4. **Start the application**:
   - Double-click the desktop shortcut "Galileosky Parser"
   - Or access via browser: http://localhost:3002

### Option 2: Manual Installation

If you prefer to install manually or the automated installer doesn't work:

#### Prerequisites

1. **Install Node.js** (v16 or higher):
   - Download from: https://nodejs.org/
   - Install with default settings

2. **Install Git**:
   - Download from: https://git-scm.com/download/win
   - Install with default settings

#### Installation Steps

1. **Open Command Prompt as Administrator**

2. **Clone the repository**:
   ```cmd
   cd %USERPROFILE%
   git clone https://github.com/haryowl/WindowsGS.git
   cd WindowsGS
   ```

3. **Install dependencies**:
   ```cmd
   npm install
   cd backend && npm install
   cd ..\frontend && npm install
   cd ..\mobile-frontend && npm install
   cd ..
   ```

4. **Configure environment**:
   ```cmd
   cd backend
   node deploy-config.js development
   cd ..\frontend
   node deploy-config.js development
   cd ..
   ```

5. **Set up admin user**:
   ```cmd
   cd backend
   node create-default-admin.js
   cd ..
   ```

6. **Build frontend**:
   ```cmd
   cd frontend
   npm run build
   cd ..
   ```

7. **Start the application**:
   ```cmd
   cd backend
   npm start
   ```

## 🌐 Access Points

After installation, access the application at:

- **Web Dashboard**: http://localhost:3002
- **Mobile Interface**: http://localhost:3004
- **Backend API**: http://localhost:3001

## 🔐 Default Login

- **Username**: `admin`
- **Password**: `admin123`

## 📁 Installation Directory

The application is installed at:
```
%USERPROFILE%\GalileoskyParser\WindowsGS\
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Node.js not found"**
   - Download and install Node.js from https://nodejs.org/
   - Restart Command Prompt after installation

2. **"Git not found"**
   - Download and install Git from https://git-scm.com/download/win
   - Restart Command Prompt after installation

3. **"Permission denied"**
   - Run Command Prompt as Administrator
   - Right-click Command Prompt → "Run as administrator"

4. **"Port already in use"**
   - Close other applications using ports 3001, 3002, or 3004
   - Or change ports in configuration files

5. **"Build failed"**
   - Ensure you have sufficient disk space (at least 1GB free)
   - Check internet connection for npm downloads
   - Try running `npm cache clean --force`

6. **"Cannot find module 'cookie-parser'" or missing dependencies**
   - **Quick Fix**: Download and run the dependency fix script:
     - [Download `fix-dependencies.bat`](https://raw.githubusercontent.com/haryowl/WindowsGS/main/fix-dependencies.bat)
     - [Download `fix-dependencies.ps1`](https://raw.githubusercontent.com/haryowl/WindowsGS/main/fix-dependencies.ps1)
   - **Manual Fix**:
     ```cmd
     cd %USERPROFILE%\GalileoskyParser\WindowsGS
     npm cache clean --force
     npm install
     cd backend && npm install
     cd ..\frontend && npm install
     cd ..\mobile-frontend && npm install
     ```

### Manual Troubleshooting

If the automated installer fails:

1. **Check prerequisites**:
   ```cmd
   node --version
   git --version
   npm --version
   ```

2. **Clear npm cache**:
   ```cmd
   npm cache clean --force
   ```

3. **Delete and reinstall**:
   ```cmd
   rmdir /s /q %USERPROFILE%\GalileoskyParser
   ```
   Then run the installer again.

## 🔄 Updates

To update the application:

1. **Using installer**: Run the installer again - it will update existing installation
2. **Manual update**:
   ```cmd
   cd %USERPROFILE%\GalileoskyParser\WindowsGS
   git pull origin main
   npm install
   cd backend && npm install
   cd ..\frontend && npm install && npm run build
   ```

## 🗑️ Uninstallation

To uninstall the application:

1. **Using uninstaller**: Run `uninstall.bat` or `uninstall.ps1` in the project folder
2. **Manual uninstall**:
   ```cmd
   rmdir /s /q %USERPROFILE%\GalileoskyParser
   ```
   Then delete desktop and start menu shortcuts manually.

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Create an issue on GitHub**: https://github.com/haryowl/WindowsGS/issues
3. **Review the documentation**: https://github.com/haryowl/WindowsGS#readme

## 🔗 Quick Links

- **Repository**: https://github.com/haryowl/WindowsGS
- **Issues**: https://github.com/haryowl/WindowsGS/issues
- **Releases**: https://github.com/haryowl/WindowsGS/releases
- **Documentation**: https://github.com/haryowl/WindowsGS#readme

---

**Note**: This application requires Windows 10 or higher and an internet connection for initial installation. 