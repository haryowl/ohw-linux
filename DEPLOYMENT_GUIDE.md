# Galileosky Application Deployment Guide

This guide helps you deploy the application to different environments and servers.

## Quick Setup

### For Local Development (localhost)

```bash
# Backend setup
cd backend
node deploy-config.js development
npm start

# Frontend setup (in another terminal)
cd frontend
node deploy-config.js development
npm start
```

### For Current Server (173.249.48.47)

```bash
# Backend setup
cd backend
node deploy-config.js current
npm start

# Frontend setup (in another terminal)
cd frontend
node deploy-config.js current
npm start
```

### For New Server (Custom IP)

```bash
# Backend setup
cd backend
node deploy-config.js custom YOUR_SERVER_IP
npm start

# Frontend setup (in another terminal)
cd frontend
node deploy-config.js custom YOUR_SERVER_IP
npm start
```

## Environment Configurations

### Development Environment
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:3002`
- **WebSocket**: `ws://localhost:3001/ws`
- **Use case**: Local development and testing

### Production Environment (Current Server)
- **Backend**: `http://173.249.48.47:3001`
- **Frontend**: `http://173.249.48.47:3002`
- **WebSocket**: `ws://173.249.48.47:3001/ws`
- **Use case**: Current production server

### Custom Production Environment
- **Backend**: `http://YOUR_SERVER_IP:3001`
- **Frontend**: `http://YOUR_SERVER_IP:3002`
- **WebSocket**: `ws://YOUR_SERVER_IP:3001/ws`
- **Use case**: Deploy to any new server

## Deployment Scripts

### Backend Configuration
```bash
cd backend
node deploy-config.js [environment]
```

**Options:**
- `development` - Local development
- `current` - Current server (173.249.48.47)
- `production` - Template for new server
- `custom <IP>` - Custom server IP

### Frontend Configuration
```bash
cd frontend
node deploy-config.js [environment]
```

**Options:**
- `development` - Local development
- `current` - Current server (173.249.48.47)
- `production` - Template for new server
- `custom <IP>` - Custom server IP

## Manual Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
NODE_ENV=production
HTTP_PORT=3001
TCP_PORT=3003
SERVER_IP=YOUR_SERVER_IP
CORS_ORIGIN=http://YOUR_SERVER_IP:3000,http://YOUR_SERVER_IP:3002,http://YOUR_SERVER_IP:3004
```

### Frontend Environment Variables
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://YOUR_SERVER_IP:3001
REACT_APP_WS_URL=ws://YOUR_SERVER_IP:3001/ws
REACT_APP_ENV=production
```

## Troubleshooting

### Authentication Issues
1. **Clear browser cache and cookies**
2. **Restart both frontend and backend servers**
3. **Check CORS configuration**
4. **Verify environment variables**

### CORS Errors
1. **Ensure backend CORS includes frontend URL**
2. **Check if credentials are being sent**
3. **Verify server IP in configuration**

### Connection Issues
1. **Check if ports are open (3001, 3002, 3003)**
2. **Verify firewall settings**
3. **Test network connectivity**

## Port Configuration

| Service | Default Port | Environment Variable |
|---------|-------------|---------------------|
| Backend HTTP | 3001 | HTTP_PORT |
| Backend TCP | 3003 | TCP_PORT |
| Frontend | 3002 | (React default) |

## Security Considerations

1. **Use HTTPS in production**
2. **Configure proper CORS origins**
3. **Set secure cookie options**
4. **Use environment variables for sensitive data**

## Migration to New Server

1. **Copy the entire project to new server**
2. **Install dependencies**: `npm install`
3. **Configure environment**: `node deploy-config.js custom NEW_IP`
4. **Start services**: `npm start`
5. **Test all functionality**

## Support

If you encounter issues:
1. Check the logs in `backend/logs/`
2. Verify environment configuration
3. Test network connectivity
4. Review CORS settings 