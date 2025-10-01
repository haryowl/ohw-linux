const { performDataSMAutoExport } = require('./src/routes/autoExport');

async function testAutoExport() {
    console.log('🧪 Testing auto-export...');
    
    const devices = [];
    const fields = [
        'deviceImei', 'datetime', 'latitude', 'longitude', 'altitude', 'satellites',
        'speed', 'userData0', 'userData1', 'userData2', 'modbus0'
    ];
    const customHeaders = {
        deviceImei: 'IMEI',
        datetime: 'Timestamp',
        latitude: 'Lat',
        longitude: 'Lon',
        altitude: 'Alt',
        satellites: 'Satellite',
        speed: 'Speed',
        userData0: 'Sensor Kiri',
        userData1: 'Sensor Kanan',
        modbus0: 'Sensor Serial (Ultrasonic)',
        userData2: 'Uptime Seconds'
    };
    
    try {
        await performDataSMAutoExport(devices, fields, customHeaders, 'test-job');
        console.log('✅ Auto-export test completed');
    } catch (error) {
        console.error('❌ Auto-export test failed:', error);
    }
}

testAutoExport();