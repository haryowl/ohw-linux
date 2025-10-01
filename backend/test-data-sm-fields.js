const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'prod.sqlite'),
    logging: false
});

async function testDataSMFields() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Test query to check recent records with userData and modbus fields
        const [results] = await sequelize.query(`
            SELECT 
                deviceImei,
                datetime,
                speed,
                userData0,
                userData1,
                userData2,
                modbus0,
                satellites,
                altitude
            FROM Records 
            WHERE deviceImei = '300234069019060'
            ORDER BY datetime DESC 
            LIMIT 5
        `);

        console.log('\n📊 Recent records for device 300234069019060:');
        console.log('='.repeat(80));
        
        results.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  Device IMEI: ${record.deviceImei}`);
            console.log(`  DateTime: ${record.datetime}`);
            console.log(`  Speed: ${record.speed} (type: ${typeof record.speed})`);
            console.log(`  UserData0: ${record.userData0} (type: ${typeof record.userData0})`);
            console.log(`  UserData1: ${record.userData1} (type: ${typeof record.userData1})`);
            console.log(`  UserData2: ${record.userData2} (type: ${typeof record.userData2})`);
            console.log(`  Modbus0: ${record.modbus0} (type: ${typeof record.modbus0})`);
            console.log(`  Satellites: ${record.satellites} (type: ${typeof record.satellites})`);
            console.log(`  Altitude: ${record.altitude} (type: ${typeof record.altitude})`);
        });

        // Check if there are any non-null values
        const [nonNullResults] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_records,
                COUNT(userData0) as userData0_count,
                COUNT(userData1) as userData1_count,
                COUNT(userData2) as userData2_count,
                COUNT(modbus0) as modbus0_count,
                COUNT(speed) as speed_count
            FROM Records 
            WHERE deviceImei = '300234069019060'
        `);

        console.log('\n📈 Field Statistics:');
        console.log('='.repeat(80));
        console.log(nonNullResults[0]);

        await sequelize.close();
        console.log('\n✅ Test completed');

    } catch (error) {
        console.error('❌ Error:', error);
        await sequelize.close();
    }
}

testDataSMFields(); 