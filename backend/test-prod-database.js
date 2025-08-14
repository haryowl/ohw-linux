const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testProdDatabase() {
    try {
        console.log('Testing production database directly...\n');
        
        const prodDbPath = path.join(__dirname, 'data', 'prod.sqlite');
        console.log('Production database path:', prodDbPath);
        
        const db = new sqlite3.Database(prodDbPath, (err) => {
            if (err) {
                console.error('Error opening production database:', err);
                return;
            }
            console.log('Successfully connected to production database');
        });
        
        // Check users
        console.log('\nChecking users in production database...');
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
            if (err) {
                console.log('Error querying users:', err.message);
            } else {
                console.log('Users count:', row.count);
            }
        });
        
        db.all('SELECT id, username, email, role FROM users LIMIT 5', (err, rows) => {
            if (err) {
                console.log('Error querying users:', err.message);
            } else {
                console.log('Sample users:', rows);
            }
        });
        
        // Check devices
        console.log('\nChecking devices in production database...');
        db.get('SELECT COUNT(*) as count FROM Devices', (err, row) => {
            if (err) {
                console.log('Error querying devices:', err.message);
            } else {
                console.log('Devices count:', row.count);
            }
        });
        
        db.all('SELECT id, imei, name, groupId FROM Devices LIMIT 5', (err, rows) => {
            if (err) {
                console.log('Error querying devices:', err.message);
            } else {
                console.log('Sample devices:', rows);
            }
        });
        
        // Check device groups
        console.log('\nChecking device groups in production database...');
        db.get('SELECT COUNT(*) as count FROM device_groups', (err, row) => {
            if (err) {
                console.log('Error querying device groups:', err.message);
            } else {
                console.log('Device groups count:', row.count);
            }
        });
        
        db.all('SELECT id, name, description FROM device_groups LIMIT 5', (err, rows) => {
            if (err) {
                console.log('Error querying device groups:', err.message);
            } else {
                console.log('Sample device groups:', rows);
            }
        });
        
        // Close database after a short delay to allow queries to complete
        setTimeout(() => {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('\nDatabase connection closed');
                }
                process.exit(0);
            });
        }, 1000);
        
    } catch (error) {
        console.error('Error testing production database:', error);
        process.exit(1);
    }
}

testProdDatabase(); 