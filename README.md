# Galileosky Parser - Windows Application

A comprehensive Windows application for parsing and managing Galileosky GPS tracking device data. This application provides real-time data processing, web-based dashboard, and mobile interface for tracking and managing GPS devices.

## 🚀 Features

### Core Functionality
- **Real-time GPS Data Parsing**: Parse Galileosky protocol packets in real-time
- **Multi-Record Support**: Handle both single and multi-record packets with dynamic tag detection (0x10 and 0x20)
- **TCP Socket Server**: Robust handling of device connections with packet buffering
- **Web Dashboard**: Modern React-based interface for data visualization
- **Mobile Interface**: Responsive mobile frontend for on-the-go access
- **User Management**: Role-based access control with admin and user roles
- **Database Management**: SQLite database with automatic schema management

### Technical Features
- **Dynamic Configuration**: Automatic detection of localhost vs IP access
- **CORS Support**: Configurable cross-origin resource sharing
- **WebSocket Integration**: Real-time data streaming
- **Authentication System**: Cookie-based session management
- **Data Export**: CSV export functionality for records
- **Device Management**: Add, edit, and manage tracking devices
- **Map Integration**: Interactive maps for device tracking

## 🏗️ Architecture

```
gali-parse/
├── backend/                 # Node.js backend server
│   ├── src/
│   │   ├── server.js       # Main server entry point
│   │   ├── app.js          # Express app configuration
│   │   ├── services/       # Business logic services
│   │   │   └── parser.js   # Galileosky protocol parser
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── config/         # Configuration files
│   └── data/               # SQLite database files
├── frontend/               # React web dashboard
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API services
│   └── build/              # Production build
├── mobile-frontend/        # Mobile-optimized interface
└── deployment/             # Deployment scripts and guides
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Windows 10/11** (for Windows-specific deployment)
- **Git** (for version control)

## 🛠️ Installation

### 🚀 Quick Installation (Windows)

**Easiest Method**: Download and run the automated installer:

1. **Download installer**:
   - [Download `install-windows.bat`](https://raw.githubusercontent.com/haryowl/WindowsGS/main/install-windows.bat)
   - [Download `install-windows.ps1`](https://raw.githubusercontent.com/haryowl/WindowsGS/main/install-windows.ps1)

2. **Run installer**:
   - **Batch**: Right-click `install-windows.bat` → "Run as administrator"
   - **PowerShell**: Right-click `install-windows.ps1` → "Run with PowerShell"

3. **Wait for completion** (5-10 minutes)

4. **Start application**: Double-click desktop shortcut or visit http://localhost:3002

**Default Login**: `admin` / `admin123`

📖 **Detailed Windows Installation Guide**: [WINDOWS_INSTALLATION.md](WINDOWS_INSTALLATION.md)

### 🔧 Manual Installation

#### Prerequisites
- **Node.js** (v16 or higher): https://nodejs.org/
- **Git**: https://git-scm.com/download/win

#### Steps

1. **Clone Repository**
```bash
git clone https://github.com/haryowl/WindowsGS.git
cd WindowsGS
```

2. **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install mobile frontend dependencies
cd ../mobile-frontend
npm install
```

3. **Configure Environment**
```bash
# Backend configuration
cd backend
node deploy-config.js development

# Frontend configuration
cd ../frontend
node deploy-config.js development
```

4. **Initialize Database**
```bash
cd backend
node create-default-admin.js
```

## 🚀 Quick Start

### Development Mode
```bash
# Start backend server
cd backend
npm start

# Start frontend (in new terminal)
cd frontend
npm start

# Start mobile frontend (optional)
cd mobile-frontend
npm start
```

### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd backend
node start-server.js
```

## 🌐 Access Points

- **Web Dashboard**: http://localhost:3002
- **Mobile Interface**: http://localhost:3004
- **Backend API**: http://localhost:3001
- **TCP Server**: localhost:3003

## 📱 Usage

### 1. Authentication
- Default admin credentials: `admin` / `admin123`
- Create additional users through the admin panel

### 2. Device Management
- Add new GPS devices with their IMEI numbers
- Configure device settings and parameters
- Monitor device status and connection

### 3. Data Monitoring
- View real-time GPS data on interactive maps
- Export historical data in CSV format
- Set up alerts and notifications

### 4. System Administration
- Manage user accounts and permissions
- Monitor system logs and performance
- Configure system settings

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
HTTP_PORT=3001
WS_PORT=3001
TCP_PORT=3003
SERVER_IP=173.249.48.47
CORS_ORIGIN=http://localhost:3002,http://localhost:3004
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001/ws
```

### Deployment Configurations

The project includes several deployment configurations:

- **Development**: Local development setup
- **Production**: Production server setup
- **Current**: Current server IP configuration
- **Custom**: Custom IP configuration

Use the deployment scripts to switch between configurations:
```bash
node deploy-config.js [development|production|current|custom]
```

## 🧪 Testing

### Parser Testing
```bash
cd backend
node run-parsing-tests.js
```

### Authentication Testing
```bash
cd backend
node diagnose-auth-issues.js
```

## 📦 Deployment

### Windows Server Deployment
1. Run the Windows deployment script:
   ```bash
   .\deploy-windows-server.ps1
   ```

2. Follow the deployment guide:
   ```bash
   # See WINDOWS_SERVER_DEPLOYMENT_GUIDE.md for detailed instructions
   ```

### PM2 Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs
```

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors (401/500)**
   ```bash
   cd backend
   node quick-fix-auth.js
   ```

2. **Database Issues**
   ```bash
   cd backend
   node fix-forwarded-column.js
   ```

3. **Frontend Build Issues**
   ```bash
   cd frontend
   # Kill any lingering processes
   taskkill /f /im node.exe
   # Clean build directory
   Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
   # Rebuild
   npm run build
   ```

4. **CORS Issues**
   - Ensure CORS origins are properly configured
   - Check that frontend and backend URLs match

### Diagnostic Tools

- `diagnose-auth-issues.js`: Check authentication system
- `check-database.js`: Verify database integrity
- `test-multi-record-parsing.js`: Test parser functionality

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Device Endpoints
- `GET /api/devices` - List all devices
- `POST /api/devices` - Add new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Records Endpoints
- `GET /api/records` - Get GPS records
- `POST /api/records/export` - Export records to CSV

### WebSocket Events
- `device:update` - Device status updates
- `record:new` - New GPS record
- `alert:new` - New alert notification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the deployment guides

## 🔄 Version History

- **v1.0.0**: Initial release with basic GPS parsing
- **v1.1.0**: Added multi-record parsing support
- **v1.2.0**: Dynamic configuration for localhost/IP access
- **v1.3.0**: Mobile frontend and enhanced deployment tools

---

**Note**: This application is specifically designed for Windows deployment and Galileosky GPS device integration. 