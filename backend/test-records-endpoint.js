// backend/test-records-endpoint.js
const axios = require('axios');

async function testRecordsEndpoint() {
    console.log('🔍 Testing records endpoint with new GPS fields...');
    
    try {
        const response = await axios.get('http://localhost:3001/api/records?range=1h&limit=5');
        
        console.log(`✅ Records endpoint test completed - Found ${response.data.length} records`);
        
        if (response.data.length > 0) {
            const firstRecord = response.data[0];
            console.log('\n📊 Sample record fields:');
            console.log(`- deviceImei: ${firstRecord.deviceImei}`);
            console.log(`- timestamp: ${firstRecord.timestamp}`);
            console.log(`- datetime: ${firstRecord.datetime}`);
            console.log(`- latitude: ${firstRecord.latitude}`);
            console.log(`- longitude: ${firstRecord.longitude}`);
            console.log(`- altitude: ${firstRecord.altitude}`);
            console.log(`- speed: ${firstRecord.speed}`);
            console.log(`- course: ${firstRecord.course}`);
            console.log(`- satellites: ${firstRecord.satellites}`);
            console.log(`- hdop: ${firstRecord.hdop}`);
            console.log(`- direction: ${firstRecord.direction}`);
            console.log(`- status: ${firstRecord.status}`);
        }
        
    } catch (error) {
        console.error('❌ Error testing records endpoint:', error.response?.data || error.message);
    }
}

testRecordsEndpoint()
    .then(() => {
        console.log('\n✅ Records endpoint test completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Records endpoint test failed:', error);
        process.exit(1);
    }); 