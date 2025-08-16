// backend/test-device-performance.js
const { Device, FieldMapping } = require('./src/models');

async function testDevicePerformance() {
    console.log('🔍 Testing device loading performance...');
    
    // Test 1: Simple device query
    console.log('\n📊 Test 1: Simple device query');
    const start1 = Date.now();
    const devices1 = await Device.findAll({
        limit: 10
    });
    const time1 = Date.now() - start1;
    console.log(`✅ Simple query: ${devices1.length} devices in ${time1}ms`);
    
    // Test 2: Devices with mappings
    console.log('\n📊 Test 2: Devices with mappings');
    const start2 = Date.now();
    const devices2 = await Device.findAll({
        include: [{
            model: FieldMapping,
            as: 'mappings',
            where: { enabled: true },
            required: false
        }],
        limit: 10
    });
    const time2 = Date.now() - start2;
    console.log(`✅ With mappings: ${devices2.length} devices in ${time2}ms`);
    
    // Test 3: Full query with ordering
    console.log('\n📊 Test 3: Full query with ordering');
    const start3 = Date.now();
    const devices3 = await Device.findAll({
        include: [{
            model: FieldMapping,
            as: 'mappings',
            where: { enabled: true },
            required: false
        }],
        order: [['lastSeen', 'DESC']],
        limit: 10
    });
    const time3 = Date.now() - start3;
    console.log(`✅ Full query: ${devices3.length} devices in ${time3}ms`);
    
    // Test 4: Count total devices
    console.log('\n📊 Test 4: Count total devices');
    const start4 = Date.now();
    const totalDevices = await Device.count();
    const time4 = Date.now() - start4;
    console.log(`✅ Total devices: ${totalDevices} in ${time4}ms`);
    
    // Test 5: Count mappings
    console.log('\n📊 Test 5: Count mappings');
    const start5 = Date.now();
    const totalMappings = await FieldMapping.count();
    const time5 = Date.now() - start5;
    console.log(`✅ Total mappings: ${totalMappings} in ${time5}ms`);
    
    console.log('\n📈 Performance Summary:');
    console.log(`- Simple query: ${time1}ms`);
    console.log(`- With mappings: ${time2}ms`);
    console.log(`- Full query: ${time3}ms`);
    console.log(`- Device count: ${time4}ms`);
    console.log(`- Mapping count: ${time5}ms`);
    
    if (time3 > 1000) {
        console.log('\n⚠️  WARNING: Device loading is slow!');
        console.log('💡 Recommendations:');
        console.log('1. Add database indexes on frequently queried fields');
        console.log('2. Consider pagination for large datasets');
        console.log('3. Implement more aggressive caching');
    } else {
        console.log('\n✅ Performance looks good!');
    }
}

// Run the test
testDevicePerformance()
    .then(() => {
        console.log('\n✅ Performance test completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Performance test failed:', error);
        process.exit(1);
    }); 