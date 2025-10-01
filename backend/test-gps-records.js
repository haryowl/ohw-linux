const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'prod.sqlite'),
    logging: false
});

async function testGPSRecords() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Find records with actual GPS data
        const [gpsResults] = await sequelize.query(`
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
            WHERE speed IS NOT NULL 
               OR altitude IS NOT NULL 
               OR latitude IS NOT NULL 
               OR longitude IS NOT NULL
            ORDER BY datetime DESC 
            LIMIT 10
        `);

        console.log('\n📊 Records with GPS data:');
        console.log('='.repeat(100));
        
        gpsResults.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  Device IMEI: ${record.deviceImei}`);
            console.log(`  DateTime: ${record.datetime}`);
            console.log(`  Server Timestamp: ${record.timestamp}`);
            console.log(`  Speed: ${record.speed}`);
            console.log(`  Altitude: ${record.altitude}`);
            console.log(`  Latitude: ${record.latitude}`);
            console.log(`  Longitude: ${record.longitude}`);
            console.log(`  Satellites: ${record.satellites}`);
        });

        // Check total count of records with GPS data
        const [countResults] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_records,
                COUNT(speed) as speed_records,
                COUNT(altitude) as altitude_records,
                COUNT(latitude) as latitude_records,
                COUNT(longitude) as longitude_records
            FROM Records
        `);

        console.log('\n📈 GPS Data Statistics:');
        console.log('='.repeat(100));
        console.log(countResults[0]);

        await sequelize.close();
        console.log('\n✅ Test completed');

    } catch (error) {
        console.error('❌ Error:', error);
        await sequelize.close();
    }
}

testGPSRecords(); 