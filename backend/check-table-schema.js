// backend/check-table-schema.js
const { Record } = require('./src/models');

async function checkTableSchema() {
    console.log('🔍 Checking Records table schema...');
    
    try {
        // Get table description
        const tableInfo = await Record.sequelize.query("PRAGMA table_info(Records)", {
            type: require('sequelize').QueryTypes.SELECT
        });
        
        console.log('\n📋 Records table columns:');
        tableInfo.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });
        
        // Test with only existing columns
        console.log('\n📊 Testing with existing columns...');
        const records = await Record.findAll({
            limit: 1,
            raw: true
        });
        
        if (records.length > 0) {
            console.log('📋 Sample record keys:', Object.keys(records[0]));
        }
        
    } catch (error) {
        console.error('❌ Error checking schema:', error);
    }
}

checkTableSchema()
    .then(() => {
        console.log('\n✅ Schema check completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Schema check failed:', error);
        process.exit(1);
    }); 