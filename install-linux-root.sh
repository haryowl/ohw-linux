#!/bin/bash

# Galileosky Parser - Linux Installer (Root Version)
# This version allows root execution for VPS/servers

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Galileosky Parser - Linux Installer (Root Version)${NC}"
echo -e "${BLUE}===================================================${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    apt-get update
    apt-get install -y nginx
fi

# Clone repository
echo -e "${YELLOW}📥 Cloning repository...${NC}"
if [ -d "gali-parse-linux" ]; then
    echo -e "${YELLOW}⚠️  Directory exists, updating...${NC}"
    cd gali-parse-linux
    git pull
else
    git clone https://github.com/haryowl/ohw-linux.git gali-parse-linux
    cd gali-parse-linux
fi

# Run the deployment script
echo -e "${YELLOW}🚀 Running deployment...${NC}"
chmod +x deploy-linux.sh
./deploy-linux.sh

echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
echo -e "${BLUE}📋 Access your application:${NC}"
echo -e "  🌐 Web Dashboard: http://localhost"
echo -e "  📱 Mobile Interface: http://localhost:3004"
echo -e "  🔧 Backend API: http://localhost:3001"
echo -e "\n${YELLOW}Management commands:${NC}"
echo -e "  📊 Check status: pm2 status"
echo -e "  📝 View logs: pm2 logs gali-parse"
echo -e "  🔄 Restart: pm2 restart gali-parse"
echo -e "  ⏹️  Stop: pm2 stop gali-parse"#!/bin/bash

# Galileosky Parser - Linux Installer (Root Version)
# This version allows root execution for VPS/servers

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Galileosky Parser - Linux Installer (Root Version)${NC}"
echo -e "${BLUE}===================================================${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    apt-get update
    apt-get install -y nginx
fi

# Clone repository
echo -e "${YELLOW}📥 Cloning repository...${NC}"
if [ -d "gali-parse-linux" ]; then
    echo -e "${YELLOW}⚠️  Directory exists, updating...${NC}"
    cd gali-parse-linux
    git pull
else
    git clone https://github.com/haryowl/ohw-linux.git gali-parse-linux
    cd gali-parse-linux
fi

# Run the deployment script
echo -e "${YELLOW}🚀 Running deployment...${NC}"
chmod +x deploy-linux.sh
./deploy-linux.sh

echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
echo -e "${BLUE}📋 Access your application:${NC}"
echo -e "  🌐 Web Dashboard: http://localhost"
echo -e "  📱 Mobile Interface: http://localhost:3004"
echo -e "  🔧 Backend API: http://localhost:3001"
echo -e "\n${YELLOW}Management commands:${NC}"
echo -e "  📊 Check status: pm2 status"
echo -e "  📝 View logs: pm2 logs gali-parse"
echo -e "  🔄 Restart: pm2 restart gali-parse"
echo -e "  ⏹️  Stop: pm2 stop gali-parse"