const { Record, Device } = require('./src/models');

async function testExportDeviceNames() {
    try {
        console.log('✅ Testing device name export logic');
        console.log('='.repeat(60));

        // Test the same query as the export
        const records = await Record.findAll({
            where: { deviceImei: '300234069019060' },
            attributes: ['deviceImei', 'datetime'],
            include: [{
                model: Device,
                as: 'device',
                attributes: ['name'],
                required: false
            }],
            order: [['datetime', 'DESC']],
            limit: 3
        });

        console.log(`Found ${records.length} records`);
        
        records.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  Device IMEI: ${record.deviceImei}`);
            console.log(`  Device object:`, record.device);
            console.log(`  Device name (direct): ${record.device?.name}`);
            console.log(`  Device dataValues:`, record.device?.dataValues);
            console.log(`  DateTime: ${record.datetime}`);
            
            // Test the same logic as the export
            let deviceName = record.deviceImei; // fallback to IMEI
            if (record.device && record.device.name) {
                deviceName = record.device.name;
                console.log(`  ✅ Using record.device.name: ${deviceName}`);
            } else if (record.device && record.device.dataValues && record.device.dataValues.name) {
                deviceName = record.device.dataValues.name;
                console.log(`  ✅ Using record.device.dataValues.name: ${deviceName}`);
            } else {
                console.log(`  ❌ Using fallback IMEI: ${deviceName}`);
            }
        });

        console.log('\n✅ Test completed');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testExportDeviceNames(); 