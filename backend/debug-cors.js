// Debug CORS configuration
try {
  const config = require('./src/config');
  console.log('🔧 CORS Configuration:');
  console.log(JSON.stringify(config.http.cors, null, 2));
} catch (error) {
  console.log('❌ Could not load config:', error.message);
  console.log('🔍 Trying to find config file...');
  
  // Try to find config file
  const fs = require('fs');
  const path = require('path');
  
  const possiblePaths = [
    './src/config.js',
    './config.js',
    './config/config.js',
    './config/config.json'
  ];
  
  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      console.log(`✅ Found config file: ${configPath}`);
      try {
        const config = require(configPath);
        console.log('📄 Config content:', JSON.stringify(config, null, 2));
      } catch (e) {
        console.log(`❌ Error loading ${configPath}:`, e.message);
      }
    }
  }
} 