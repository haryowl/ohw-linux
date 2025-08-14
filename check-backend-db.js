const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'data', 'dev.sqlite');

console.log('Checking database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the database.');
});

db.all("PRAGMA table_info(Records)", [], (err, rows) => {
    if (err) {
        console.error('Error querying schema:', err.message);
    } else {
        console.log('Records table schema:');
        console.log(JSON.stringify(rows, null, 2));
    }
    
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
}); 