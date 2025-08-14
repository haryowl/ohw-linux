const { sequelize } = require('./backend/src/models');
const path = require('path');
const fs = require('fs');

async function checkDatabase() {
    try {
        console.log('Checking database connection and files...\n');
        
        // Check database files
        const dataDir = path.join(__dirname, 'backend', 'data');
        console.log('Data directory:', dataDir);
        
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir);
            console.log('Files in data directory:', files);
            
            for (const file of files) {
                const filePath = path.join(dataDir, file);
                const stats = fs.statSync(filePath);
                console.log(`- ${file}: ${stats.size} bytes`);
            }
        } else {
            console.log('Data directory does not exist');
        }
        
        // Test database connection
        console.log('\nTesting database connection...');
        await sequelize.authenticate();
        console.log('Database connection successful');
        
        // Check which database we're connected to
        const config = sequelize.config;
        console.log('Database config:', {
            dialect: config.dialect,
            storage: config.storage,
            database: config.database
        });
        
        // Check if tables exist
        console.log('\nChecking if tables exist...');
        const tables = await sequelize.showAllSchemas();
        console.log('Available schemas/tables:', tables);
        
        // Try to query users table directly
        console.log('\nTrying to query users table directly...');
        try {
            const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
            console.log('Users count:', users[0].count);
            
            const [allUsers] = await sequelize.query('SELECT id, username, email, role FROM users LIMIT 5');
            console.log('Sample users:', allUsers);
        } catch (error) {
            console.log('Error querying users table:', error.message);
        }
        
        // Try to query devices table directly
        console.log('\nTrying to query devices table directly...');
        try {
            const [devices] = await sequelize.query('SELECT COUNT(*) as count FROM Devices');
            console.log('Devices count:', devices[0].count);
            
            const [allDevices] = await sequelize.query('SELECT id, imei, name, groupId FROM Devices LIMIT 5');
            console.log('Sample devices:', allDevices);
        } catch (error) {
            console.log('Error querying devices table:', error.message);
        }
        
    } catch (error) {
        console.error('Database check error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkDatabase(); 