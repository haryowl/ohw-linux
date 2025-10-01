const http = require('http');

function simulateFrontendRequest() {
  console.log('🔧 Simulating frontend request...');
  
  // First, login to get a session cookie
  const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData),
      'Origin': 'http://173.249.48.47:3002',
      'Referer': 'http://173.249.48.47:3002/'
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    console.log(`📡 Login Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Login Response:`, data);
      
      if (res.statusCode === 200) {
        console.log('✅ Login successful');
        
        // Extract session cookie
        const setCookieHeaders = res.headers['set-cookie'];
        if (setCookieHeaders) {
          const sessionCookie = setCookieHeaders.find(cookie => 
            cookie.includes('sessionToken=') && !cookie.includes('Expires=Thu, 01 Jan 1970')
          );
          
          if (sessionCookie) {
            const cookieValue = sessionCookie.split(';')[0];
            console.log('🍪 Session cookie:', cookieValue);
            
            // Now test the roles API with the cookie
            testRolesAPI(cookieValue);
          }
        }
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error('❌ Login request error:', e.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testRolesAPI(cookieValue) {
  console.log('🔧 Testing roles API with frontend-style request...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/roles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieValue,
      'Origin': 'http://173.249.48.47:3002',
      'Referer': 'http://173.249.48.47:3002/role-management'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Roles API Status: ${res.statusCode}`);
    console.log(`📡 Content-Type: ${res.headers['content-type']}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Roles API Response (first 200 chars):`, data.substring(0, 200));
      
      if (res.statusCode === 200) {
        console.log('✅ Roles API working correctly');
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Valid JSON response');
          console.log(`📊 Found ${jsonData.length} roles`);
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }
      } else if (res.statusCode === 401) {
        console.log('❌ Authentication required');
      } else if (res.statusCode === 403) {
        console.log('❌ Admin access required');
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
        if (data.includes('<!doctype')) {
          console.log('❌ HTML response detected - this is the problem!');
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Roles request error:', e.message);
  });

  req.end();
}

setTimeout(simulateFrontendRequest, 2000); 