// backend/add-gps-fields-migration.js
const { Record } = require('./src/models');

async function addGpsFields() {
    console.log('🔧 Adding missing GPS fields to Records table...');
    
    try {
        // Add the missing GPS columns to the existing table
        await Record.sequelize.query(`
            ALTER TABLE Records ADD COLUMN altitude FLOAT;
        `);
        console.log('✅ Added altitude column');
        
        await Record.sequelize.query(`
            ALTER TABLE Records ADD COLUMN course FLOAT;
        `);
        console.log('✅ Added course column');
        
        await Record.sequelize.query(`
            ALTER TABLE Records ADD COLUMN satellites INTEGER;
        `);
        console.log('✅ Added satellites column');
        
        await Record.sequelize.query(`
            ALTER TABLE Records ADD COLUMN hdop FLOAT;
        `);
        console.log('✅ Added hdop column');
        
        // Verify the columns were added
        const tableInfo = await Record.sequelize.query("PRAGMA table_info(Records)", {
            type: require('sequelize').QueryTypes.SELECT
        });
        
        console.log('\n📋 Updated Records table columns:');
        const gpsColumns = ['altitude', 'course', 'satellites', 'hdop'];
        tableInfo.forEach(col => {
            const isGps = gpsColumns.includes(col.name);
            console.log(`  - ${col.name} (${col.type})${isGps ? ' 🆕' : ''}`);
        });
        
        console.log('\n🎉 GPS fields migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Error adding GPS fields:', error);
        if (error.message.includes('duplicate column name')) {
            console.log('ℹ️  Some columns may already exist, continuing...');
        } else {
            throw error;
        }
    }
}

// Run the migration
addGpsFields()
    .then(() => {
        console.log('\n✅ Migration completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }); 