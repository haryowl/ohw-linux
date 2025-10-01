# Gali-Parse Linux Deployment Guide

## Prerequisites
- Ubuntu 20.04+ or Debian 10+
- Root or sudo access
- Internet connection

## Quick Deployment

1. **Copy project to Linux server**
2. **Make deployment script executable:**
   ```bash
   chmod +x deploy-linux.sh
   ```
3. **Run deployment script:**
   ```bash
   ./deploy-linux.sh
   ```

## Manual Deployment Steps

### 1. Install System Dependencies
```bash
sudo apt-get update
sudo apt-get install -y curl wget git build-essential nginx
```

### 2. Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2
```bash
sudo npm install -g pm2
```

### 4. Setup Project
```bash
mkdir -p backend/data backend/exports logs
chmod 755 backend/data backend/exports logs
```

### 5. Install Dependencies
```bash
cd backend && npm install --production
cd ../frontend && npm install && npm run build
cd ..
```

### 6. Configure Environment
Create `.env` file with production settings

### 7. Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configure Nginx
```bash
sudo cp nginx.conf /etc/nginx/sites-available/gali-parse
sudo ln -sf /etc/nginx/sites-available/gali-parse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Management Commands

- **Check status:** `pm2 status`
- **View logs:** `pm2 logs gali-parse`
- **Restart:** `pm2 restart gali-parse`
- **Stop:** `pm2 stop gali-parse`
- **Monitor:** `pm2 monit`

## Security Considerations

1. **Update server_name in Nginx config**
2. **Configure SSL certificate**
3. **Set up firewall rules**
4. **Configure log rotation**
5. **Set up database backups**

## Troubleshooting

- **Check PM2 logs:** `pm2 logs gali-parse`
- **Check Nginx status:** `sudo systemctl status nginx`
- **Test Nginx config:** `sudo nginx -t`
- **Check ports:** `netstat -tlnp | grep :3001`