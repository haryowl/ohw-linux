const fs = require('fs');
const path = require('path');

// Configuration for different environments
const environments = {
    development: {
        NODE_ENV: 'development',
        HTTP_PORT: '3001',
        TCP_PORT: '3003',
        SERVER_IP: 'localhost',
        CORS_ORIGIN: 'http://localhost:3000,http://localhost:3002,http://localhost:3004,http://127.0.0.1:3000,http://127.0.0.1:3002,http://127.0.0.1:3004'
    },
    production: {
        NODE_ENV: 'production',
        HTTP_PORT: '3001',
        TCP_PORT: '3003',
        SERVER_IP: 'YOUR_SERVER_IP',
        CORS_ORIGIN: 'http://YOUR_SERVER_IP:3000,http://YOUR_SERVER_IP:3002,http://YOUR_SERVER_IP:3004'
    },
    current: {
        NODE_ENV: 'production',
        HTTP_PORT: '3001',
        TCP_PORT: '3003',
        SERVER_IP: '173.249.48.47',
        CORS_ORIGIN: 'http://173.249.48.47:3000,http://173.249.48.47:3002,http://173.249.48.47:3004,http://localhost:3000,http://localhost:3002,http://localhost:3004,http://127.0.0.1:3000,http://127.0.0.1:3002,http://127.0.0.1:3004'
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
            finalValue = value.replace(/YOUR_SERVER_IP/g, customIP);
        }
        envContent += `${key}=${finalValue}\n`;
    }

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log(`✅ Created .env file for environment: ${envName}`);
    if (customIP) {
        console.log(`   Custom IP: ${customIP}`);
    }
    console.log(`   Server IP: ${envContent.match(/SERVER_IP=(.+)/)[1]}`);
    console.log(`   HTTP Port: ${envContent.match(/HTTP_PORT=(.+)/)[1]}`);
}

function showUsage() {
    console.log('=== Backend Deployment Configuration ===\n');
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
    console.log('1. Restart your backend server');
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
console.log('1. Restart your backend server');
console.log('2. Update frontend configuration to match');
console.log('3. Test the application'); 