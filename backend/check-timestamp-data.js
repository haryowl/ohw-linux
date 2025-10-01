// backend/check-timestamp-data.js
const { Record } = require('./src/models');

async function checkTimestampData() {
    console.log('🔍 Checking timestamp data in records...');
    
    try {
        // Count total records
        const total = await Record.count();
        console.log(`Total records: ${total}`);
        
        // Count records with timestamp
        const withTimestamp = await Record.count({
            where: {
                timestamp: { [require('sequelize').Op.ne]: null }
            }
        });
        console.log(`Records with timestamp: ${withTimestamp}`);
        
        // Count records with datetime
        const withDatetime = await Record.count({
            where: {
                datetime: { [require('sequelize').Op.ne]: null }
            }
        });
        console.log(`Records with datetime: ${withDatetime}`);
        
        // Get a sample record
        const sample = await Record.findOne({
            order: [['datetime', 'DESC']],
            limit: 1
        });
        
        if (sample) {
            console.log('\n📊 Sample record:');
            console.log(`- timestamp: ${sample.timestamp}`);
            console.log(`- datetime: ${sample.datetime}`);
            console.log(`- deviceImei: ${sample.deviceImei}`);
            console.log(`- createdAt: ${sample.createdAt}`);
        }
        
    } catch (error) {
        console.error('❌ Error checking timestamp data:', error);
    }
}

checkTimestampData()
    .then(() => {
        console.log('\n✅ Timestamp data check completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Timestamp data check failed:', error);
        process.exit(1);
    }); 