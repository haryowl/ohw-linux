#!/bin/bash

# Galileosky Parser - Linux Compatibility Fix Script
# This script fixes all Windows-specific code for Linux deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Linux Compatibility Issues...${NC}\n"

# Fix 1: Update frontend package.json
echo -e "${YELLOW}📦 Fixing frontend/package.json...${NC}"
sed -i 's/"start": "set NODE_OPTIONS=--max-old-space-size=12288 && react-scripts start"/"start": "NODE_OPTIONS=--max-old-space-size=12288 react-scripts start"/g' frontend/package.json
sed -i 's/"build": "set NODE_OPTIONS=--max-old-space-size=12288 && react-scripts build"/"build": "NODE_OPTIONS=--max-old-space-size=12288 react-scripts build"/g' frontend/package.json
echo -e "${GREEN}✅ Frontend package.json fixed${NC}\n"

# Fix 2: Update mobile-frontend package.json
echo -e "${YELLOW}📦 Fixing mobile-frontend/package.json...${NC}"
sed -i 's/"start": "set NODE_OPTIONS=--max-old-space-size=12288 && react-scripts start"/"start": "NODE_OPTIONS=--max-old-space-size=12288 react-scripts start"/g' mobile-frontend/package.json
sed -i 's/"build": "set NODE_OPTIONS=--max-old-space-size=12288 && react-scripts build"/"build": "NODE_OPTIONS=--max-old-space-size=12288 react-scripts build"/g' mobile-frontend/package.json
echo -e "${GREEN}✅ Mobile frontend package.json fixed${NC}\n"

# Fix 3: Update root package.json - clean script
echo -e "${YELLOW}📦 Fixing root package.json...${NC}"
sed -i 's|"clean": "cd frontend && Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue && cd ../mobile-frontend && Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue"|"clean": "rm -rf frontend/build mobile-frontend/build"|g' package.json

# Fix 4: Remove OS restrictions from root package.json
sed -i '/"os": \[/,/\],/d' package.json
sed -i '/"cpu": \[/,/\]/d' package.json
echo -e "${GREEN}✅ Root package.json fixed${NC}\n"

# Fix 5: Update package.json name and description
echo -e "${YELLOW}📦 Updating project metadata...${NC}"
sed -i 's/"galileosky-parser-windows"/"galileosky-parser-linux"/g' package.json
sed -i 's/Windows application/Linux application/g' package.json
sed -i 's/WindowsGS/ohw-linux/g' package.json
echo -e "${GREEN}✅ Project metadata updated${NC}\n"

# Fix 6: Make shell scripts executable
echo -e "${YELLOW}🔐 Making shell scripts executable...${NC}"
chmod +x deploy-linux.sh
chmod +x mobile-frontend/start-mobile.sh 2>/dev/null || true
echo -e "${GREEN}✅ Shell scripts are now executable${NC}\n"

echo -e "${GREEN}🎉 All Linux compatibility fixes applied successfully!${NC}"
echo -e "${BLUE}📋 Summary of changes:${NC}"
echo -e "  ✓ Fixed frontend build scripts"
echo -e "  ✓ Fixed mobile-frontend build scripts"
echo -e "  ✓ Fixed root package.json clean script"
echo -e "  ✓ Removed Windows OS restrictions"
echo -e "  ✓ Updated project metadata"
echo -e "  ✓ Made shell scripts executable"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Test the fixes: npm run build"
echo -e "  2. Commit changes: git add . && git commit -m 'Fix Linux compatibility'"
echo -e "  3. Push to GitHub: git push origin main"