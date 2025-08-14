# Complete Installation Guide - Galileosky Parser Windows

This guide provides a complete, step-by-step installation process for the Galileosky Parser Windows application.

## 🚀 Quick Installation (Recommended)

### Prerequisites
- **Windows 10 or higher**
- **Internet connection** (for downloading dependencies)
- **Administrator privileges** (recommended)

### Installation Steps

#### Step 1: Download the Installer
1. **Download the complete installer**:
   - [Download `install-windows-complete.bat`](https://raw.githubusercontent.com/haryowl/WindowsGS/main/install-windows-complete.bat)

#### Step 2: Run the Installer
1. **Right-click** the downloaded `install-windows-complete.bat` file
2. **Select "Run as administrator"**
3. **Wait for installation to complete** (10-15 minutes)
4. **Follow the on-screen instructions**

#### Step 3: Start the Application
1. **Double-click** the desktop shortcut "Galileosky Parser"
2. **Or manually start**:
   ```cmd
   cd %USERPROFILE%\GalileoskyParser\WindowsGS\backend
   npm start
   ```

## 📁 Installation Directory Structure

The application will be installed at:
```
%USERPROFILE%\GalileoskyParser\WindowsGS\
├── backend\          # Backend server
├── frontend\         # Web dashboard
├── mobile-frontend\  # Mobile interface
├── README.txt        # User documentation
└── uninstall.bat     # Uninstaller
```

## 🌐 Access Points

After installation, access the application at:

- **Web Dashboard**: http://localhost:3002
- **Mobile Interface**: http://localhost:3004
- **Backend API**: http://localhost:3001

## 🔐 Default Login

- **Username**: `admin`
- **Password**: `admin123`

## 🛠️ Manual Installation (Alternative)

If the automated installer doesn't work, follow these manual steps:

### Step 1: Install Prerequisites

#### Install Node.js
1. Download from: https://nodejs.org/
2. Install with default settings
3. Restart Command Prompt

#### Install Git
1. Download from: https://git-scm.com/download/win
2. Install with default settings
3. Restart Command Prompt

### Step 2: Clone Repository
```cmd
cd %USERPROFILE%
git clone https://github.com/haryowl/WindowsGS.git
cd WindowsGS
```

### Step 3: Install Dependencies
```cmd
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..\frontend
npm install

# Install mobile frontend dependencies
cd ..\mobile-frontend
npm install
cd ..
```

### Step 4: Configure Environment
```cmd
# Configure backend
cd backend
node deploy-config.js development

# Configure frontend
cd ..\frontend
node deploy-config.js development
cd ..
```

### Step 5: Initialize Database
```cmd
cd backend
node create-default-admin.js
cd ..
```

### Step 6: Build Frontend
```cmd
cd frontend
npm run build
cd ..
```

### Step 7: Start Application
```cmd
cd backend
npm start
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Node.js not found"
**Solution**: Install Node.js from https://nodejs.org/

#### 2. "Git not found"
**Solution**: Install Git from https://git-scm.com/download/win

#### 3. "Permission denied"
**Solution**: Run Command Prompt as Administrator

#### 4. "Cannot find module 'cookie-parser'"
**Solution**: Run the dependency fix:
```cmd
cd %USERPROFILE%\GalileoskyParser\WindowsGS\backend
npm install cookie-parser@1.4.6
```

#### 5. "Cannot find module 'index.html'"
**Solution**: Run the missing files fix:
```cmd
cd %USERPROFILE%\GalileoskyParser\WindowsGS
git pull origin main
cd frontend
npm run build
```

#### 6. "Port already in use"
**Solution**: Close other applications using ports 3001, 3002, or 3004

#### 7. "Database schema error"
**Solution**: Run the database fix:
```cmd
cd %USERPROFILE%\GalileoskyParser\WindowsGS\backend
node fix-forwarded-column.js
```

### Quick Fix Scripts

Download and run these fix scripts if you encounter issues:

1. **Dependency Issues**: [fix-dependencies.bat](https://raw.githubusercontent.com/haryowl/WindowsGS/main/fix-dependencies.bat)
2. **Missing Files**: [fix-missing-files.bat](https://raw.githubusercontent.com/haryowl/WindowsGS/main/fix-missing-files.bat)
3. **Database Issues**: [fix-database-schema.bat](https://raw.githubusercontent.com/haryowl/WindowsGS/main/fix-database-schema.bat)
4. **Frontend Issues**: [fix-frontend-config.bat](https://raw.githubusercontent.com/haryowl/WindowsGS/main/fix-frontend-config.bat)

## 🔄 Updates

To update the application:

```cmd
cd %USERPROFILE%\GalileoskyParser\WindowsGS
git pull origin main
npm install
cd backend && npm install
cd ..\frontend && npm install && npm run build
```

## 🗑️ Uninstallation

To uninstall the application:

1. **Using uninstaller**: Run `uninstall.bat` in the project folder
2. **Manual uninstall**:
   ```cmd
   rmdir /s /q %USERPROFILE%\GalileoskyParser
   ```
   Then delete desktop and start menu shortcuts manually.

## 📞 Support

If you encounter issues:

1. **Check this troubleshooting guide**
2. **Create an issue on GitHub**: https://github.com/haryowl/WindowsGS/issues
3. **Review the documentation**: https://github.com/haryowl/WindowsGS#readme

## 🔗 Quick Links

- **Repository**: https://github.com/haryowl/WindowsGS
- **Issues**: https://github.com/haryowl/WindowsGS/issues
- **Releases**: https://github.com/haryowl/WindowsGS/releases
- **Documentation**: https://github.com/haryowl/WindowsGS#readme

---

**Note**: This application requires Windows 10 or higher and an internet connection for initial installation. The installation process takes approximately 10-15 minutes depending on your internet speed and system performance. 