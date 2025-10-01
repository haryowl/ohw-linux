const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'prod.sqlite'),
    logging: false
});

async function debugSpeedSave() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Check recent records for device 300234069807970 (Kapal02)
        const [results] = await sequelize.query(`
            SELECT 
                deviceImei,
                datetime,
                timestamp,
                speed,
                altitude,
                latitude,
                longitude,
                satellites
            FROM Records 
            WHERE deviceImei = '300234069807970'
            ORDER BY datetime DESC 
            LIMIT 10
        `);

        console.log('\n📊 Recent records for Kapal02 (300234069807970):');
        console.log('='.repeat(80));
        
        results.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  DateTime: ${record.datetime}`);
            console.log(`  Server Timestamp: ${record.timestamp}`);
            console.log(`  Speed: ${record.speed} (type: ${typeof record.speed})`);
            console.log(`  Altitude: ${record.altitude} (type: ${typeof record.altitude})`);
            console.log(`  Latitude: ${record.latitude} (type: ${typeof record.latitude})`);
            console.log(`  Longitude: ${record.longitude} (type: ${typeof record.longitude})`);
            console.log(`  Satellites: ${record.satellites} (type: ${typeof record.satellites})`);
        });

        // Check if there are any records with speed = 0
        const [zeroSpeedResults] = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM Records 
            WHERE deviceImei = '300234069807970' AND speed = 0
        `);

        console.log('\n📈 Speed Statistics:');
        console.log('='.repeat(80));
        console.log(`Records with speed = 0: ${zeroSpeedResults[0].count}`);

        // Check if there are any records with speed = null
        const [nullSpeedResults] = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM Records 
            WHERE deviceImei = '300234069807970' AND speed IS NULL
        `);

        console.log(`Records with speed = NULL: ${nullSpeedResults[0].count}`);

        await sequelize.close();
        console.log('\n✅ Debug completed');

    } catch (error) {
        console.error('❌ Error:', error);
        await sequelize.close();
    }
}

debugSpeedSave(); 