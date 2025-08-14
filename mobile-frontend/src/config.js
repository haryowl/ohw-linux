// Mobile Frontend Configuration

// API Configuration
export const API_CONFIG = {
  // For remote access, change this to your server's IP/domain
  // Example: 'http://173.249.48.47:3001/api'
  // For local development: 'http://localhost:3001/api'
  BASE_URL: process.env.REACT_APP_API_URL || getDefaultApiUrl(),
};

// Determine default API URL based on current location
function getDefaultApiUrl() {
  const hostname = window.location.hostname;
  
  // If accessing from remote server, use the server's backend
  if (hostname === '173.249.48.47') {
    return 'http://173.249.48.47:3001/api';
  }
  
  // For localhost or other local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // Default fallback - use current hostname with backend port
  return `http://${hostname}:3001/api`;
}

// App Configuration
export const APP_CONFIG = {
  NAME: 'GalileoSky Parser Mobile',
  VERSION: '1.0.0',
  DESCRIPTION: 'Mobile-friendly interface for GalileoSky Parser system',
};

// Feature Flags
export const FEATURES = {
  ENABLE_WEBSOCKET: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_OFFLINE_MODE: false,
};

export default {
  API_CONFIG,
  APP_CONFIG,
  FEATURES,
}; 