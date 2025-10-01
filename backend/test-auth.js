const http = require('http');

function testAuth() {
  console.log('🔧 Testing authentication...');
  
  // First, let's test the auth check endpoint
  const authOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/check',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const authReq = http.request(authOptions, (res) => {
    console.log(`📡 Auth Check Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Auth Check Response:`, data);
      
      if (res.statusCode === 200) {
        console.log('✅ User is authenticated');
        // Now test the roles API
        testRolesWithAuth();
      } else {
        console.log('❌ User is not authenticated');
        console.log('💡 You need to log in first');
        console.log('🔍 The issue is likely a CORS/session cookie problem');
        console.log('🌐 Frontend: http://173.249.48.47:3002');
        console.log('🔧 Backend: http://173.249.48.47:3001');
        console.log('🍪 The session cookie may not be shared between ports');
      }
    });
  });

  authReq.on('error', (e) => {
    console.error('❌ Auth request error:', e.message);
  });

  authReq.end();
}

function testRolesWithAuth() {
  console.log('🔧 Testing Roles API with authentication...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/roles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Roles API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Roles API Response:`, data.substring(0, 200));
      
      if (res.statusCode === 200) {
        console.log('✅ Roles API working correctly');
      } else if (res.statusCode === 401) {
        console.log('❌ Authentication required for roles API');
      } else if (res.statusCode === 403) {
        console.log('❌ Admin access required for roles API');
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Roles request error:', e.message);
  });

  req.end();
}

// Wait a moment for server to start, then test
setTimeout(testAuth, 2000); 