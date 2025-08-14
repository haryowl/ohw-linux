const fs = require('fs');
const path = require('path');

// Configuration for different environments
const environments = {
    development: {
        REACT_APP_API_URL: 'http://localhost:3001',
        REACT_APP_WS_URL: 'ws://localhost:3001/ws',
        REACT_APP_ENV: 'development'
    },
    production: {
        REACT_APP_API_URL: 'http://YOUR_SERVER_IP:3001',
        REACT_APP_WS_URL: 'ws://YOUR_SERVER_IP:3001/ws',
        REACT_APP_ENV: 'production'
    },
    current: {
        REACT_APP_API_URL: 'http://173.249.48.47:3001',
        REACT_APP_WS_URL: 'ws://173.249.48.47:3001/ws',
        REACT_APP_ENV: 'production'
    }
};

function createEnvFile(envName, customIP = null) {
    const env = environments[envName];
    if (!env) {
        console.error(`❌ Environment "${envName}" not found`);
        console.log('Available environments:', Object.keys(environments).join(', '));
        return;
    }

    let envContent = '';
    for (const [key, value] of Object.entries(env)) {
        let finalValue = value;
        if (customIP && value.includes('YOUR_SERVER_IP')) {
            finalValue = value.replace('YOUR_SERVER_IP', customIP);
        }
        envContent += `${key}=${finalValue}\n`;
    }

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log(`✅ Created .env file for environment: ${envName}`);
    if (customIP) {
        console.log(`   Custom IP: ${customIP}`);
    }
    console.log(`   API URL: ${envContent.match(/REACT_APP_API_URL=(.+)/)[1]}`);
}

function showUsage() {
    console.log('=== Frontend Deployment Configuration ===\n');
    console.log('Usage:');
    console.log('  node deploy-config.js development');
    console.log('  node deploy-config.js production');
    console.log('  node deploy-config.js current');
    console.log('  node deploy-config.js custom <IP_ADDRESS>');
    console.log('');
    console.log('Examples:');
    console.log('  node deploy-config.js development          # Local development');
    console.log('  node deploy-config.js current              # Current server (173.249.48.47)');
    console.log('  node deploy-config.js custom 192.168.1.100 # Custom server IP');
    console.log('');
    console.log('After running this script:');
    console.log('1. Restart your frontend development server');
    console.log('2. The new configuration will be active');
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help') {
    showUsage();
    process.exit(0);
}

if (command === 'custom') {
    const customIP = args[1];
    if (!customIP) {
        console.error('❌ Please provide an IP address for custom deployment');
        console.log('Example: node deploy-config.js custom 192.168.1.100');
        process.exit(1);
    }
    createEnvFile('production', customIP);
} else {
    createEnvFile(command);
}

console.log('\n=== Next Steps ===');
console.log('1. Restart your frontend development server');
console.log('2. Clear browser cache and cookies');
console.log('3. Try accessing the application again'); 