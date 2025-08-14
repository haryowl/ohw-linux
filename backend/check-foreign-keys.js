const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/prod.sqlite');

console.log('Checking foreign keys for Records table...');
db.all("PRAGMA foreign_key_list('Records');", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Foreign keys for Records table:');
        if (rows.length === 0) {
            console.log('No foreign keys found');
        } else {
            rows.forEach(row => console.log(row));
        }
    }
    
    console.log('\nChecking table schema for Records...');
    db.all("PRAGMA table_info('Records');", (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('Records table schema:');
            rows.forEach(row => console.log(row));
        }
        
        console.log('\nChecking table schema for Devices...');
        db.all("PRAGMA table_info('Devices');", (err, rows) => {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log('Devices table schema:');
                rows.forEach(row => console.log(row));
            }
            db.close();
        });
    });
}); 