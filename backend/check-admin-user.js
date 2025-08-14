const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/prod.sqlite');

console.log('Checking admin user in database...');

db.all("SELECT id, username, firstName, lastName, role, isActive, permissions FROM users WHERE username = 'admin'", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Admin user details:');
        if (rows.length === 0) {
            console.log('No admin user found!');
        } else {
            rows.forEach(row => {
                console.log('- ID:', row.id);
                console.log('- Username:', row.username);
                console.log('- First Name:', row.firstName);
                console.log('- Last Name:', row.lastName);
                console.log('- Role:', row.role);
                console.log('- Is Active:', row.isActive);
                console.log('- Permissions:', row.permissions);
            });
        }
    }
    
    console.log('\nAll users in database:');
    db.all("SELECT id, username, firstName, lastName, role, isActive FROM users", (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            if (rows.length === 0) {
                console.log('No users found!');
            } else {
                rows.forEach(row => {
                    console.log(`- ID: ${row.id}, Username: ${row.username}, Role: ${row.role}, Active: ${row.isActive}`);
                });
            }
        }
        db.close();
    });
}); 