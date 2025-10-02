#!/bin/bash

# Gali-Parse Linux Deployment Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Gali-Parse Linux Deployment${NC}"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${YELLOW}⚠️  This script should not be run as root${NC}"
   exit 1
fi

echo -e "${BLUE}📋 Installing System Dependencies${NC}"
sudo apt-get update
sudo apt-get install -y curl wget git build-essential nginx

echo -e "${BLUE}📋 Installing Node.js 20${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo -e "${BLUE}📋 Installing PM2${NC}"
sudo npm install -g pm2

echo -e "${BLUE}📋 Setting up Project${NC}"
mkdir -p backend/data backend/exports logs
chmod 755 backend/data backend/exports logs

echo -e "${BLUE}📋 Installing Dependencies${NC}"
cd backend && npm install --production
cd ../frontend && npm install && npm run build
cd ..

echo -e "${BLUE}📋 Creating Environment File${NC}"
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=backend/database.sqlite
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=http://localhost:3000
AUTO_EXPORT_ENABLED=true
EXPORT_DIR=backend/exports
CONFIG_DIR=backend/data
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF

echo -e "${BLUE}📋 Creating PM2 Config${NC}"
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'gali-parse',
    script: 'backend/src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};
EOF

echo -e "${BLUE}📋 Initializing Database${NC}"
cd backend
NODE_ENV=production node init-database.js
NODE_ENV=production node create-default-admin.js
cd ..

echo -e "${BLUE}📋 Starting Application${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${BLUE}📋 Configuring Nginx${NC}"
sudo tee /etc/nginx/sites-available/gali-parse << 'EOF'
server {
    listen 80;
    server_name localhost;

    location / {
        root /path/to/your/project/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/gali-parse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}🎉 Deployment Completed!${NC}"
echo "Application: http://localhost"
echo "PM2 Status: pm2 status"
echo "Logs: pm2 logs gali-parse"