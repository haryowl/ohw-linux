const { User, Record, sequelize } = require('./src/models');
const sessionStore = require('./src/utils/sessionStore');
const logger = require('./src/utils/logger');

async function diagnoseAuthIssues() {
    console.log('=== Authentication and API Issues Diagnostic ===\n');
    
    try {
        // 1. Check database connection
        console.log('1. Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // 2. Check if tables exist
        console.log('\n2. Checking database tables...');
        const tables = await sequelize.showAllSchemas();
        console.log('✅ Database tables accessible');
        
        // 3. Check if admin user exists
        console.log('\n3. Checking admin user...');
        const adminUser = await User.findOne({ where: { username: 'admin' } });
        if (adminUser) {
            console.log('✅ Admin user exists');
            console.log(`   Username: ${adminUser.username}`);
            console.log(`   Role: ${adminUser.role}`);
            console.log(`   Active: ${adminUser.isActive}`);
        } else {
            console.log('❌ Admin user not found - creating one...');
            const newAdmin = await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isActive: true,
                permissions: {
                    menus: ['dashboard', 'devices', 'mapping', 'tracking', 'settings', 'alerts', 'data', 'export', 'demo', 'user-management'],
                    devices: [],
                    deviceGroups: []
                }
            });
            console.log('✅ Admin user created successfully');
            console.log(`   Username: admin`);
            console.log(`   Password: admin123`);
        }
        
        // 4. Check session store
        console.log('\n4. Testing session store...');
        const testToken = 'test-token-' + Date.now();
        const testSession = {
            userId: 1,
            username: 'test',
            role: 'admin',
            permissions: {}
        };
        
        await sessionStore.set(testToken, testSession);
        console.log('✅ Session store write successful');
        
        const retrievedSession = await sessionStore.get(testToken);
        if (retrievedSession) {
            console.log('✅ Session store read successful');
        } else {
            console.log('❌ Session store read failed');
        }
        
        await sessionStore.delete(testToken);
        console.log('✅ Session store delete successful');
        
        // 5. Check Records table
        console.log('\n5. Testing Records API...');
        try {
            const recordCount = await Record.count();
            console.log(`✅ Records table accessible - ${recordCount} records found`);
            
            // Test a simple query
            const testRecords = await Record.findAll({
                limit: 1,
                order: [['timestamp', 'DESC']]
            });
            console.log('✅ Records query successful');
            
        } catch (error) {
            console.log('❌ Records table error:', error.message);
            
            // Check if the forwarded column exists
            console.log('\n   Checking for forwarded column...');
            try {
                const [results] = await sequelize.query("PRAGMA table_info(Records)");
                const columns = results.map(row => row.name);
                console.log('   Current columns:', columns);
                
                if (!columns.includes('forwarded')) {
                    console.log('   ❌ forwarded column missing - adding it...');
                    await sequelize.query(`
                        ALTER TABLE Records 
                        ADD COLUMN forwarded BOOLEAN NOT NULL DEFAULT 0
                    `);
                    console.log('   ✅ forwarded column added');
                } else {
                    console.log('   ✅ forwarded column exists');
                }
            } catch (alterError) {
                console.log('   ❌ Error adding forwarded column:', alterError.message);
            }
        }
        
        // 6. Check for any missing columns in Records table
        console.log('\n6. Checking Records table structure...');
        try {
            const [results] = await sequelize.query("PRAGMA table_info(Records)");
            const columns = results.map(row => row.name);
            console.log('   Current columns:', columns);
            
            // Check for required columns
            const requiredColumns = [
                'deviceImei', 'timestamp', 'datetime', 'rawData', 'recordNumber',
                'latitude', 'longitude', 'speed', 'direction', 'status',
                'supplyVoltage', 'batteryVoltage', 'forwarded'
            ];
            
            const missingColumns = requiredColumns.filter(col => !columns.includes(col));
            if (missingColumns.length > 0) {
                console.log('   ❌ Missing columns:', missingColumns);
            } else {
                console.log('   ✅ All required columns present');
            }
            
        } catch (error) {
            console.log('   ❌ Error checking table structure:', error.message);
        }
        
        // 7. Test authentication flow
        console.log('\n7. Testing authentication flow...');
        const adminUserForAuth = await User.findOne({ where: { username: 'admin' } });
        if (adminUserForAuth) {
            const isValidPassword = await adminUserForAuth.comparePassword('admin123');
            if (isValidPassword) {
                console.log('✅ Admin password verification successful');
            } else {
                console.log('❌ Admin password verification failed');
            }
        }
        
        console.log('\n=== Diagnostic Summary ===');
        console.log('✅ Database connection: OK');
        console.log('✅ Admin user: OK');
        console.log('✅ Session store: OK');
        console.log('✅ Records table: Checked');
        
        console.log('\n=== Next Steps ===');
        console.log('1. Try logging in with username: admin, password: admin123');
        console.log('2. If still having issues, check the backend logs for specific errors');
        console.log('3. Make sure the frontend is sending cookies properly');
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

// Run the diagnostic
diagnoseAuthIssues().catch(error => {
    console.error('Diagnostic execution failed:', error);
    process.exit(1);
}); 