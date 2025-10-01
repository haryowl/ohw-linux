const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'prod.sqlite'),
    logging: false
});

async function testDeviceNames() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Test the same query as the export
        const [results] = await sequelize.query(`
            SELECT 
                r.deviceImei,
                r.datetime,
                d.name as deviceName
            FROM Records r
            LEFT JOIN Devices d ON r.deviceImei = d.imei
            WHERE r.deviceImei = '300234069019060'
            ORDER BY r.datetime DESC 
            LIMIT 5
        `);

        console.log('\n📊 Device name test results:');
        console.log('='.repeat(80));
        
        results.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  Device IMEI: ${record.deviceImei}`);
            console.log(`  Device Name: ${record.deviceName || 'NULL'}`);
            console.log(`  DateTime: ${record.datetime}`);
        });

        // Check if the device exists in the Devices table
        const [deviceResults] = await sequelize.query(`
            SELECT imei, name FROM Devices WHERE imei = '300234069019060'
        `);

        console.log('\n📋 Device table check:');
        console.log('='.repeat(80));
        if (deviceResults.length > 0) {
            deviceResults.forEach(device => {
                console.log(`  IMEI: ${device.imei}, Name: ${device.name}`);
            });
        } else {
            console.log('  ❌ Device not found in Devices table');
        }

        // Check all devices
        const [allDevices] = await sequelize.query(`
            SELECT imei, name FROM Devices ORDER BY name
        `);

        console.log('\n📋 All devices in database:');
        console.log('='.repeat(80));
        allDevices.forEach(device => {
            console.log(`  IMEI: ${device.imei}, Name: ${device.name}`);
        });

        await sequelize.close();
        console.log('\n✅ Test completed');

    } catch (error) {
        console.error('❌ Error:', error);
        await sequelize.close();
    }
}

testDeviceNames(); 