// backend/test-device-locations.js
const { Device, Record } = require('./src/models');
const { Op } = require('sequelize');

async function testDeviceLocations() {
    console.log('🔍 Testing hybrid device locations endpoint...');
    
    try {
        const requestStart = Date.now();
        
        // Get all devices
        const devices = await Device.findAll({
            order: [['lastSeen', 'DESC']],
            limit: 10
        });
        
        console.log(`Found ${devices.length} devices`);
        
        // Get device IMEIs for location lookup
        const deviceImeis = devices.map(device => device.imei);
        
        // Get recent location data (last 1 hour only for speed)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentRecords = await Record.findAll({
            where: {
                deviceImei: { [Op.in]: deviceImeis },
                latitude: { [Op.ne]: null },
                longitude: { [Op.ne]: null },
                datetime: { [Op.gte]: oneHourAgo }
            },
            attributes: [
                'deviceImei',
                'latitude',
                'longitude', 
                'datetime',
                'speed',
                'direction',
                'altitude',
                'satellites',
                'hdop'
            ],
            order: [['datetime', 'DESC']],
            limit: 1000, // Limit to prevent slow queries
            raw: true
        });
        
        // Create location map (take latest for each device)
        const locationMap = new Map();
        recentRecords.forEach(record => {
            if (!locationMap.has(record.deviceImei) || 
                new Date(record.datetime) > new Date(locationMap.get(record.deviceImei).timestamp)) {
                locationMap.set(record.deviceImei, {
                    latitude: record.latitude,
                    longitude: record.longitude,
                    timestamp: record.datetime,
                    speed: record.speed,
                    direction: record.direction,
                    altitude: record.altitude,
                    satellites: record.satellites,
                    hdop: record.hdop
                });
            }
        });
        
        // Combine devices with their locations
        const devicesWithLocations = devices.map(device => ({
            id: device.id,
            imei: device.imei,
            name: device.name,
            location: locationMap.get(device.imei) || null
        }));
        
        const totalTime = Date.now() - requestStart;
        console.log(`✅ Hybrid device locations test completed in ${totalTime}ms`);
        console.log(`📊 Found ${devicesWithLocations.length} devices with ${locationMap.size} locations`);
        
        // Show results
        devicesWithLocations.forEach(device => {
            if (device.location) {
                console.log(`📍 ${device.name || device.imei}: ${device.location.latitude}, ${device.location.longitude}`);
            } else {
                console.log(`❌ ${device.name || device.imei}: No recent location data (last hour)`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error testing device locations:', error);
    }
}

testDeviceLocations()
    .then(() => {
        console.log('\n✅ Device locations test completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Device locations test failed:', error);
        process.exit(1);
    }); 