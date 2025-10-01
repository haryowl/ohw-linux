const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'prod.sqlite'),
    logging: false
});

async function testRecentRecords() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Test query to check recent records with GPS data
        const [results] = await sequelize.query(`
            SELECT 
                deviceImei,
                datetime,
                timestamp,
                speed,
                altitude,
                latitude,
                longitude,
                satellites,
                userData0,
                userData1,
                userData2,
                modbus0
            FROM Records 
            WHERE deviceImei IN ('300234069019060', '300234069804940')
            ORDER BY datetime DESC 
            LIMIT 20
        `);

        console.log('\n📊 Recent records (last 20):');
        console.log('='.repeat(100));
        
        results.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  Device IMEI: ${record.deviceImei}`);
            console.log(`  DateTime: ${record.datetime}`);
            console.log(`  Server Timestamp: ${record.timestamp}`);
            console.log(`  Speed: ${record.speed} (type: ${typeof record.speed})`);
            console.log(`  Altitude: ${record.altitude} (type: ${typeof record.altitude})`);
            console.log(`  Latitude: ${record.latitude} (type: ${typeof record.latitude})`);
            console.log(`  Longitude: ${record.longitude} (type: ${typeof record.longitude})`);
            console.log(`  Satellites: ${record.satellites} (type: ${typeof record.satellites})`);
            console.log(`  UserData0: ${record.userData0} (type: ${typeof record.userData0})`);
            console.log(`  UserData1: ${record.userData1} (type: ${typeof record.userData1})`);
            console.log(`  UserData2: ${record.userData2} (type: ${typeof record.userData2})`);
            console.log(`  Modbus0: ${record.modbus0} (type: ${typeof record.modbus0})`);
        });

        // Check records from the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const [recentResults] = await sequelize.query(`
            SELECT 
                deviceImei,
                datetime,
                speed,
                altitude,
                satellites
            FROM Records 
            WHERE datetime > ? AND deviceImei IN ('300234069019060', '300234069804940')
            ORDER BY datetime DESC 
            LIMIT 10
        `, {
            replacements: [oneHourAgo.toISOString()]
        });

        console.log('\n📊 Records from last hour:');
        console.log('='.repeat(100));
        
        recentResults.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  Device IMEI: ${record.deviceImei}`);
            console.log(`  DateTime: ${record.datetime}`);
            console.log(`  Speed: ${record.speed}`);
            console.log(`  Altitude: ${record.altitude}`);
            console.log(`  Satellites: ${record.satellites}`);
        });

        await sequelize.close();
        console.log('\n✅ Test completed');

    } catch (error) {
        console.error('❌ Error:', error);
        await sequelize.close();
    }
}

testRecentRecords(); 