# Deployment Quick Reference

## Quick Start Commands

### 1. Automated Deployment
```powershell
# Run as Administrator
.\deploy-windows-server.ps1 -ServerIP "192.168.1.100" -JWTSecret "your-secure-jwt-secret"
```

### 2. Manual Deployment Steps
```powershell
# Install Node.js (if not installed)
winget install OpenJS.NodeJS

# Install PM2
npm install -g pm2
pm2 install pm2-windows-service

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Setup database
cd backend
npm run migrate
node create-default-admin.js
cd ..

# Build frontend
cd frontend && npm run build && cd ..

# Start services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Service Management

### PM2 Commands
```powershell
# Check status
pm2 status

# View logs
pm2 logs
pm2 logs galileosky-backend
pm2 logs galileosky-frontend

# Restart services
pm2 restart all
pm2 restart galileosky-backend
pm2 restart galileosky-frontend

# Stop services
pm2 stop all

# Delete services
pm2 delete all

# Monitor resources
pm2 monit

# Save configuration
pm2 save

# Setup startup
pm2 startup
```

### Windows Service Commands
```powershell
# Check PM2 service
Get-Service | Where-Object {$_.Name -like "*PM2*"}

# Start/Stop PM2 service
Start-Service PM2
Stop-Service PM2

# Restart PM2 service
Restart-Service PM2
```

## Configuration

### Environment Variables (.env)
```env
NODE_ENV=production
PORT=3001
HTTP_PORT=3001
WS_PORT=3001
TCP_PORT=3003
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### Production Config (backend/src/config/production.js)
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

## Firewall Configuration

### PowerShell Commands
```powershell
# Open required ports
New-NetFirewallRule -DisplayName "Galileosky Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
New-NetFirewallRule -DisplayName "Galileosky Frontend" -Direction Inbound -Protocol TCP -LocalPort 3002 -Action Allow
New-NetFirewallRule -DisplayName "Galileosky TCP Parser" -Direction Inbound -Protocol TCP -LocalPort 3003 -Action Allow

# Remove rules
Remove-NetFirewallRule -DisplayName "Galileosky Backend"
Remove-NetFirewallRule -DisplayName "Galileosky Frontend"
Remove-NetFirewallRule -DisplayName "Galileosky TCP Parser"
```

## Troubleshooting

### Port Issues
```powershell
# Check what's using a port
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <PID> /F
```

### Permission Issues
```powershell
# Grant permissions to project folder
icacls "C:\Projects\gali-parse" /grant "Everyone:(OI)(CI)F"

# Run PowerShell as Administrator
```

### Memory Issues
```powershell
# Increase Node.js memory limit
set NODE_OPTIONS=--max-old-space-size=4096

# Check memory usage
pm2 monit
```

### Database Issues
```powershell
# Check database file
dir C:\Projects\gali-parse\backend\data

# Recreate database (WARNING: deletes all data)
Remove-Item C:\Projects\gali-parse\backend\data\database.sqlite
cd backend
npm run migrate
node create-default-admin.js
cd ..
```

### Frontend Build Issues
```powershell
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### PM2 Issues
```powershell
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
pm2 save
```

## Backup and Recovery

### Backup Database
```powershell
# Navigate to backend
cd C:\Projects\gali-parse\backend

# Run backup script
node scripts/backup.js

# Manual backup
$backupPath = "C:\Backups\gali-parse"
$date = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupFile = "$backupPath\backup-$date.zip"
Compress-Archive -Path "C:\Projects\gali-parse\backend\data" -DestinationPath $backupFile
```

### Restore Database
```powershell
# Stop services
pm2 stop all

# Restore from backup
Expand-Archive -Path "C:\Backups\gali-parse\backup-YYYY-MM-DD-HHMMSS.zip" -DestinationPath "C:\Projects\gali-parse\backend\data"

# Start services
pm2 start ecosystem.config.js
```

## Update Application

### Full Update Process
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

### Quick Update (if only backend changed)
```powershell
# Restart backend only
pm2 restart galileosky-backend
```

## Monitoring

### System Resources
```powershell
# Monitor with PM2
pm2 monit

# Check disk space
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, Size, FreeSpace

# Check memory usage
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10
```

### Application Logs
```powershell
# View all logs
pm2 logs

# View specific service logs
pm2 logs galileosky-backend
pm2 logs galileosky-frontend

# Clear logs
pm2 flush
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Change default admin password
- [ ] Configure firewall rules
- [ ] Use HTTPS in production
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup database regularly

## Performance Optimization

### Memory Management
```javascript
// In ecosystem.config.js
max_memory_restart: '2G'
```

### Log Rotation
```javascript
// In ecosystem.config.js
log_file: './logs/combined.log',
out_file: './logs/out.log',
error_file: './logs/error.log'
```

## Common Issues and Solutions

### Issue: Services won't start
**Solution**: Check logs with `pm2 logs` and verify all dependencies are installed

### Issue: Frontend shows blank page
**Solution**: Check if backend is running and accessible at the correct URL

### Issue: Database connection errors
**Solution**: Verify database file exists and has proper permissions

### Issue: Port already in use
**Solution**: Use `netstat -ano | findstr :3001` to find and kill the process

### Issue: PM2 service not starting on boot
**Solution**: Run `pm2 startup` and `pm2 save` as Administrator

---

## Quick Commands Reference

| Task | Command |
|------|---------|
| Check status | `pm2 status` |
| View logs | `pm2 logs` |
| Restart all | `pm2 restart all` |
| Stop all | `pm2 stop all` |
| Monitor | `pm2 monit` |
| Check ports | `netstat -ano \| findstr :3001` |
| Backup DB | `cd backend && node scripts/backup.js` |
| Update app | `git pull && npm install && pm2 restart all` | 