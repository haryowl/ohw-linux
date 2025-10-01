# Galileosky Parser - Linux Edition

A comprehensive Linux application for parsing and managing Galileosky GPS tracking device data. This application provides real-time data processing, web-based dashboard, and mobile interface for tracking and managing GPS devices.

## 🚀 Quick Installation

### One-Command Install
```bash
curl -sSL https://raw.githubusercontent.com/haryowl/ohw-linux/main/install-linux.sh | bash
```

### Manual Installation
```bash
# Clone repository
git clone https://github.com/haryowl/ohw-linux.git
cd ohw-linux

# Run deployment script
chmod +x deploy-linux.sh
./deploy-linux.sh
```

## 📋 Prerequisites

- **Ubuntu 20.04+** or **Debian 10+**
- **Node.js 16+** (automatically installed)
- **Git** (for cloning)
- **Root or sudo access**

## 🌐 Access Points

- **Web Dashboard**: http://localhost
- **Mobile Interface**: http://localhost:3004
- **Backend API**: http://localhost:3001
- **TCP Server**: localhost:3003

## 🔧 Management Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs gali-parse

# Restart application
pm2 restart gali-parse

# Stop application
pm2 stop gali-parse

# Monitor resources
pm2 monit
```

## 🔒 Default Login

- **Username**: `admin`
- **Password**: `admin123`

## 🛠️ Configuration

### Environment Variables
The application automatically configures itself for Linux deployment. Key settings:

- **Backend Port**: 3001
- **Frontend Port**: 80 (via Nginx)
- **Mobile Port**: 3004
- **TCP Port**: 3003
- **Database**: SQLite (production)

### Custom Configuration
To customize the installation:

1. Edit `backend/.env` for backend settings
2. Edit `frontend/.env` for frontend settings
3. Edit `/etc/nginx/sites-available/gali-parse` for web server settings

## 🔄 Updates

To update the application:

```bash
cd gali-parse-linux
git pull
pm2 restart gali-parse
```

## 🐛 Troubleshooting

### Check Application Status
```bash
pm2 status
pm2 logs gali-parse
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check Ports
```bash
netstat -tlnp | grep :3001
netstat -tlnp | grep :80
```

### Restart Services
```bash
pm2 restart gali-parse
sudo systemctl restart nginx
```

## 📚 Features

- **Real-time GPS Data Parsing**: Parse Galileosky protocol packets
- **Multi-Record Support**: Handle both single and multi-record packets
- **Web Dashboard**: Modern React-based interface
- **Mobile Interface**: Responsive mobile frontend
- **User Management**: Role-based access control
- **Data Export**: CSV export functionality
- **Interactive Maps**: GPS tracking visualization
- **Alert System**: Device monitoring and notifications

## 🤝 Support

For support and questions:
- Create an issue on [GitHub](https://github.com/haryowl/ohw-linux/issues)
- Check the troubleshooting section above
- Review the deployment guides

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.