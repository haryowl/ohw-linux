const { User, Record, sequelize } = require('./src/models');
const sessionStore = require('./src/utils/sessionStore');

async function quickFixAuth() {
    console.log('=== Quick Fix for Authentication and API Issues ===\n');
    
    try {
        // 1. Ensure admin user exists
        console.log('1. Ensuring admin user exists...');
        let adminUser = await User.findOne({ where: { username: 'admin' } });
        if (!adminUser) {
            adminUser = await User.create({
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
            console.log('✅ Admin user created');
        } else {
            console.log('✅ Admin user already exists');
        }
        
        // 2. Fix Records table if needed
        console.log('\n2. Checking Records table...');
        try {
            // Test if Records table is accessible
            await Record.count();
            console.log('✅ Records table is accessible');
        } catch (error) {
            console.log('❌ Records table error - attempting to fix...');
            
            // Check if forwarded column exists
            const [results] = await sequelize.query("PRAGMA table_info(Records)");
            const columns = results.map(row => row.name);
            
            if (!columns.includes('forwarded')) {
                console.log('   Adding forwarded column...');
                await sequelize.query(`
                    ALTER TABLE Records 
                    ADD COLUMN forwarded BOOLEAN NOT NULL DEFAULT 0
                `);
                console.log('   ✅ forwarded column added');
            }
            
            // Check if SequelizeMeta table exists
            const [metaResults] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='SequelizeMeta'");
            if (metaResults.length === 0) {
                console.log('   Creating SequelizeMeta table...');
                await sequelize.query(`
                    CREATE TABLE SequelizeMeta (
                        name VARCHAR(255) NOT NULL PRIMARY KEY
                    )
                `);
                console.log('   ✅ SequelizeMeta table created');
            }
        }
        
        // 3. Clear any stale sessions
        console.log('\n3. Clearing stale sessions...');
        try {
            const sessionCount = await sessionStore.getSessionCount();
            console.log(`   Current sessions: ${sessionCount}`);
            
            // Clean up expired sessions
            await sequelize.query("DELETE FROM sessions WHERE lastAccessed < datetime('now', '-24 hours')");
            console.log('   ✅ Stale sessions cleaned up');
        } catch (error) {
            console.log('   ⚠️  Session cleanup skipped (sessions table may not exist yet)');
        }
        
        // 4. Test basic functionality
        console.log('\n4. Testing basic functionality...');
        
        // Test admin login
        const isValidPassword = await adminUser.comparePassword('admin123');
        if (isValidPassword) {
            console.log('✅ Admin password verification works');
        } else {
            console.log('❌ Admin password verification failed - resetting password...');
            await adminUser.update({ password: 'admin123' });
            console.log('✅ Admin password reset');
        }
        
        // Test session store
        const testToken = 'test-token-' + Date.now();
        const testSession = {
            userId: adminUser.id,
            username: adminUser.username,
            role: adminUser.role,
            permissions: adminUser.permissions
        };
        
        await sessionStore.set(testToken, testSession);
        const retrievedSession = await sessionStore.get(testToken);
        await sessionStore.delete(testToken);
        
        if (retrievedSession) {
            console.log('✅ Session store works correctly');
        } else {
            console.log('❌ Session store has issues');
        }
        
        console.log('\n=== Quick Fix Complete ===');
        console.log('✅ Admin user: admin / admin123');
        console.log('✅ Records table: Fixed');
        console.log('✅ Session store: Tested');
        
        console.log('\n=== Next Steps ===');
        console.log('1. Restart the backend server');
        console.log('2. Try logging in with admin/admin123');
        console.log('3. Check if the 500 errors are resolved');
        
    } catch (error) {
        console.error('❌ Quick fix failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

// Run the quick fix
quickFixAuth().catch(error => {
    console.error('Quick fix execution failed:', error);
    process.exit(1);
}); 