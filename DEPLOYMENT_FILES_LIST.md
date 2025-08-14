# Deployment Files List - Galileosky Parser

This document lists all files and folders that need to be copied to the Windows Server for deployment.

## 📁 **Essential Files & Folders (REQUIRED)**

### **Root Level**
```
gali-parse/
├── package.json                    # Root dependencies
├── package-lock.json              # Lock file for root dependencies
├── ecosystem.config.js            # PM2 process configuration
└── deploy-windows-server.ps1      # Automated deployment script
```

### **Backend (REQUIRED)**
```
gali-parse/backend/
├── package.json                   # Backend dependencies
├── package-lock.json             # Lock file for backend dependencies
├── .sequelizerc                  # Sequelize configuration
├── jsconfig.json                 # JavaScript configuration
├── .eslintrc.js                  # ESLint configuration
├── .npmrc                        # NPM configuration
├── service-config.js             # Service configuration
├── debug-config.js               # Debug configuration
├── ecosystem.config.js           # Backend PM2 configuration
├── src/                          # Source code (ENTIRE FOLDER)
│   ├── app.js                    # Main application file
│   ├── server.js                 # Server entry point
│   ├── config/                   # Configuration files
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic services
│   ├── middleware/               # Express middleware
│   ├── migrations/               # Database migrations
│   ├── utils/                    # Utility functions
│   └── logs/                     # Log files directory
├── scripts/                      # Database and utility scripts
│   ├── migrate.js                # Migration runner
│   ├── backup.js                 # Database backup
│   ├── clean.js                  # Data cleanup
│   ├── seed.js                   # Database seeding
│   ├── add-custom-fields.js      # Custom fields setup
│   └── fix-custom-fields.js      # Custom fields fix
├── data/                         # Database directory (will be created)
├── backups/                      # Backup directory (will be created)
├── logs/                         # Log directory (will be created)
└── output/                       # Output directory (will be created)
```

### **Frontend (REQUIRED)**
```
gali-parse/frontend/
├── package.json                  # Frontend dependencies
├── package-lock.json            # Lock file for frontend dependencies
├── service-config.js            # Service configuration
├── serve.json                   # Serve configuration
├── src/                         # Source code (ENTIRE FOLDER)
│   ├── App.js                   # Main React component
│   ├── index.js                 # React entry point
│   ├── index.css                # Global styles
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API services
│   └── utils/                   # Utility functions
├── public/                      # Public assets
│   ├── index.html               # HTML template
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
├── build/                       # Built files (will be created)
└── logs/                        # Log directory (will be created)
```

## 📁 **Optional Files & Folders**

### **Documentation (OPTIONAL but RECOMMENDED)**
```
gali-parse/
├── WINDOWS_SERVER_DEPLOYMENT_GUIDE.md    # Deployment guide
├── DEPLOYMENT_QUICK_REFERENCE.md         # Quick reference
├── DEPLOYMENT_FILES_LIST.md              # This file
├── README.md                             # Project readme
├── LICENSE                               # License file
└── .gitignore                           # Git ignore file
```

### **Development & Testing Files (OPTIONAL)**
```
gali-parse/
├── test-custom-fields.js                # Custom fields test
├── check-schema.js                      # Database schema check
├── create-default-admin.js              # Admin user creation
├── make-admin.js                        # Admin user management
├── check-backend-db.js                  # Database connection test
├── list-tables.js                       # Database table listing
└── gali-parse.code-workspace            # VS Code workspace
```

### **Mobile & Additional Features (OPTIONAL)**
```
gali-parse/
├── mobile-*.js                          # Mobile-related scripts
├── termux-*.js                          # Termux scripts
├── peer-*.js                            # Peer sync scripts
├── *.sh                                 # Shell scripts
├── *.bat                                # Batch files
├── *.ps1                                # PowerShell scripts
└── *.md                                 # Documentation files
```

## 🚫 **Files & Folders to EXCLUDE**

### **Development Dependencies**
```
gali-parse/
├── node_modules/                        # Will be installed on server
├── .git/                                # Git repository data
├── logs/                                # Local logs (will be created)
├── backups/                             # Local backups (will be created)
├── data/                                # Local data (will be created)
└── mobile-sync-*/                       # Mobile sync data
```

### **Build Artifacts**
```
gali-parse/frontend/
├── build/                               # Will be built on server
└── node_modules/                        # Will be installed on server
```

### **Backend Build Artifacts**
```
gali-parse/backend/
├── node_modules/                        # Will be installed on server
├── data/                                # Will be created on server
├── backups/                             # Will be created on server
├── logs/                                # Will be created on server
└── output/                              # Will be created on server
```

## 📋 **Copy Methods**

### **Method 1: ZIP Archive (Recommended)**
```powershell
# Create deployment package
Compress-Archive -Path @(
    "package.json",
    "package-lock.json", 
    "ecosystem.config.js",
    "deploy-windows-server.ps1",
    "backend",
    "frontend",
    "WINDOWS_SERVER_DEPLOYMENT_GUIDE.md",
    "DEPLOYMENT_QUICK_REFERENCE.md",
    "DEPLOYMENT_FILES_LIST.md"
) -DestinationPath "gali-parse-deployment.zip"
```

### **Method 2: Manual Copy**
```powershell
# Create directory structure
New-Item -ItemType Directory -Path "C:\Projects\gali-parse" -Force

# Copy essential files
Copy-Item "package.json" "C:\Projects\gali-parse\"
Copy-Item "package-lock.json" "C:\Projects\gali-parse\"
Copy-Item "ecosystem.config.js" "C:\Projects\gali-parse\"
Copy-Item "deploy-windows-server.ps1" "C:\Projects\gali-parse\"

# Copy backend (excluding node_modules and data)
Copy-Item "backend" "C:\Projects\gali-parse\" -Recurse -Exclude "node_modules", "data", "backups", "logs", "output"

# Copy frontend (excluding node_modules and build)
Copy-Item "frontend" "C:\Projects\gali-parse\" -Recurse -Exclude "node_modules", "build", "logs"

# Copy documentation
Copy-Item "WINDOWS_SERVER_DEPLOYMENT_GUIDE.md" "C:\Projects\gali-parse\"
Copy-Item "DEPLOYMENT_QUICK_REFERENCE.md" "C:\Projects\gali-parse\"
Copy-Item "DEPLOYMENT_FILES_LIST.md" "C:\Projects\gali-parse\"
```

### **Method 3: Git Clone (if using Git)**
```powershell
# Clone repository
git clone <repository-url> C:\Projects\gali-parse

# Remove unnecessary files
Remove-Item "C:\Projects\gali-parse\.git" -Recurse -Force
Remove-Item "C:\Projects\gali-parse\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Projects\gali-parse\backend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Projects\gali-parse\frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Projects\gali-parse\backend\data" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Projects\gali-parse\frontend\build" -Recurse -Force -ErrorAction SilentlyContinue
```

## 🔧 **Post-Copy Setup**

After copying files, run these commands on the server:

```powershell
# Navigate to project directory
cd C:\Projects\gali-parse

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Create necessary directories
New-Item -ItemType Directory -Path "backend\data" -Force
New-Item -ItemType Directory -Path "backend\backups" -Force
New-Item -ItemType Directory -Path "backend\logs" -Force
New-Item -ItemType Directory -Path "backend\output" -Force
New-Item -ItemType Directory -Path "frontend\logs" -Force
New-Item -ItemType Directory -Path "logs" -Force

# Build frontend
cd frontend && npm run build && cd ..

# Run database setup
cd backend
npm run migrate
node create-default-admin.js
cd ..
```

## 📊 **File Size Estimates**

| Component | Size (approx) | Notes |
|-----------|---------------|-------|
| Root files | 1-2 MB | Configuration and scripts |
| Backend source | 2-5 MB | Application code |
| Frontend source | 10-20 MB | React application |
| Documentation | 1-2 MB | Guides and references |
| **Total (source only)** | **15-30 MB** | Without node_modules |
| **Total (with dependencies)** | **200-500 MB** | After npm install |

## ✅ **Verification Checklist**

After copying, verify these files exist:

- [ ] `package.json` (root)
- [ ] `ecosystem.config.js` (root)
- [ ] `backend/package.json`
- [ ] `backend/src/server.js`
- [ ] `backend/src/app.js`
- [ ] `frontend/package.json`
- [ ] `frontend/src/App.js`
- [ ] `frontend/public/index.html`
- [ ] `WINDOWS_SERVER_DEPLOYMENT_GUIDE.md`

## 🚨 **Important Notes**

1. **Never copy `node_modules`** - Dependencies will be installed on the server
2. **Never copy `data` folders** - Database files will be created on the server
3. **Never copy `build` folders** - Frontend will be built on the server
4. **Always copy `package.json` and `package-lock.json`** - Required for dependency installation
5. **Always copy source code** - All `.js`, `.jsx`, `.css`, `.html` files
6. **Always copy configuration files** - `.json`, `.js` config files
7. **Always copy documentation** - Deployment guides and references

## 🔄 **Update Process**

When updating the application:

1. **Stop services**: `pm2 stop all`
2. **Backup current version**: Copy entire project folder
3. **Copy new files**: Replace source files (keep `node_modules` and `data`)
4. **Install new dependencies**: `npm install` in all directories
5. **Build frontend**: `cd frontend && npm run build && cd ..`
6. **Run migrations**: `cd backend && npm run migrate && cd ..`
7. **Start services**: `pm2 start ecosystem.config.js`
8. **Save configuration**: `pm2 save` 