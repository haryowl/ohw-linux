const http = require('http');

function testRolesAPI() {
  console.log('🔧 Testing Roles API endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/roles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'connect.sid=test' // Add a test session cookie
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Response Body (first 500 chars):`);
      console.log(data.substring(0, 500));
      
      if (data.includes('<!doctype')) {
        console.log('❌ HTML response detected - this indicates an error page');
        console.log('🔍 This usually means:');
        console.log('   - Route not found (404)');
        console.log('   - Server error (500)');
        console.log('   - Authentication redirect');
      } else {
        console.log('✅ JSON response detected');
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Valid JSON response');
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.end();
}

// Wait a moment for server to start, then test
setTimeout(testRolesAPI, 2000); 