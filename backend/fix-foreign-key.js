const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/prod.sqlite');

console.log('Fixing foreign key constraint...');

// First, drop the existing foreign key constraint
db.run("PRAGMA foreign_keys=OFF;", (err) => {
    if (err) {
        console.error('Error disabling foreign keys:', err);
        return;
    }
    
    console.log('Foreign keys disabled');
    
    // Drop the existing foreign key constraint
    db.run("DROP INDEX IF EXISTS sqlite_autoindex_Records_1;", (err) => {
        if (err) {
            console.error('Error dropping index:', err);
        } else {
            console.log('Dropped existing index');
        }
        
        // Create the correct foreign key constraint
        db.run(`
            CREATE TABLE Records_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                deviceImei VARCHAR(255) NOT NULL,
                timestamp DATETIME NOT NULL,
                datetime DATETIME,
                rawData TEXT,
                recordNumber INTEGER,
                latitude FLOAT,
                longitude FLOAT,
                speed FLOAT,
                direction FLOAT,
                status VARCHAR(255),
                supplyVoltage FLOAT,
                batteryVoltage FLOAT,
                input0 TINYINT(1),
                input1 TINYINT(1),
                input2 TINYINT(1),
                input3 TINYINT(1),
                inputVoltage0 FLOAT,
                inputVoltage1 FLOAT,
                inputVoltage2 FLOAT,
                inputVoltage3 FLOAT,
                inputVoltage4 FLOAT,
                inputVoltage5 FLOAT,
                inputVoltage6 FLOAT,
                userData0 VARCHAR(255),
                userData1 VARCHAR(255),
                userData2 VARCHAR(255),
                userData3 VARCHAR(255),
                userData4 VARCHAR(255),
                userData5 VARCHAR(255),
                userData6 VARCHAR(255),
                userData7 VARCHAR(255),
                modbus0 VARCHAR(255),
                modbus1 VARCHAR(255),
                modbus2 VARCHAR(255),
                modbus3 VARCHAR(255),
                modbus4 VARCHAR(255),
                modbus5 VARCHAR(255),
                modbus6 VARCHAR(255),
                modbus7 VARCHAR(255),
                modbus8 VARCHAR(255),
                modbus9 VARCHAR(255),
                modbus10 VARCHAR(255),
                modbus11 VARCHAR(255),
                modbus12 VARCHAR(255),
                modbus13 VARCHAR(255),
                modbus14 VARCHAR(255),
                modbus15 VARCHAR(255),
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                FOREIGN KEY (deviceImei) REFERENCES Devices(imei) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('Error creating new table:', err);
                return;
            }
            
            console.log('Created new Records table with correct foreign key');
            
            // Copy data from old table to new table
            db.run("INSERT INTO Records_new SELECT * FROM Records;", (err) => {
                if (err) {
                    console.error('Error copying data:', err);
                    return;
                }
                
                console.log('Copied data to new table');
                
                // Drop old table and rename new table
                db.run("DROP TABLE Records;", (err) => {
                    if (err) {
                        console.error('Error dropping old table:', err);
                        return;
                    }
                    
                    console.log('Dropped old Records table');
                    
                    db.run("ALTER TABLE Records_new RENAME TO Records;", (err) => {
                        if (err) {
                            console.error('Error renaming table:', err);
                            return;
                        }
                        
                        console.log('Renamed new table to Records');
                        
                        // Re-enable foreign keys
                        db.run("PRAGMA foreign_keys=ON;", (err) => {
                            if (err) {
                                console.error('Error enabling foreign keys:', err);
                            } else {
                                console.log('Foreign keys enabled');
                                console.log('Foreign key constraint fixed successfully!');
                            }
                            db.close();
                        });
                    });
                });
            });
        });
    });
}); 