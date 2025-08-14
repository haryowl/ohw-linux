#!/bin/bash

# Gali Parse Mobile Frontend Startup Script
echo "🚀 Starting Gali Parse Mobile Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the mobile-frontend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if backend is running (optional)
echo "🔍 Checking backend connection..."
if curl -s http://localhost:3001/api/auth/check > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3001"
else
    echo "⚠️  Backend not detected on port 3001. Make sure the backend is running."
    echo "   You can still start the frontend, but API calls will fail."
fi

# Start the development server
echo "🌐 Starting development server..."
echo "📱 Mobile frontend will be available at: http://localhost:3000"
echo "📱 For mobile testing, use your device's IP address or ngrok"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start 