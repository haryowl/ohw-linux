#!/bin/bash

# Setup GitHub Repository for Linux Deployment
# This script prepares the project for GitHub deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up GitHub Repository for Linux Deployment${NC}\n"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing Git repository...${NC}"
    git init
fi

# Add all files
echo -e "${YELLOW}📦 Adding files to Git...${NC}"
git add .

# Create initial commit
echo -e "${YELLOW}📝 Creating initial commit...${NC}"
git commit -m "Initial Linux-compatible version of Galileosky Parser"

# Add remote origin
echo -e "${YELLOW}🔗 Adding GitHub remote...${NC}"
git remote add origin https://github.com/haryowl/ohw-linux.git

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git branch -M main
git push -u origin main

echo -e "${GREEN}🎉 GitHub repository setup completed!${NC}"
echo -e "${BLUE}📋 Repository URL: https://github.com/haryowl/ohw-linux${NC}"
echo -e "${BLUE}📋 Installation URL: https://raw.githubusercontent.com/haryowl/ohw-linux/main/install-linux.sh${NC}"