const http = require('http');

function testCompleteFlow() {
  console.log('🔧 Testing complete authentication and roles flow...');
  
  // Step 1: Login
  loginAndTest();
}

function loginAndTest() {
  console.log('\n1️⃣ Testing login...');
  
  const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(options, (res) => {
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
        const setCookieHeader = res.headers['set-cookie'];
        if (setCookieHeader) {
          const sessionCookie = setCookieHeader.find(cookie => cookie.includes('sessionToken'));
          if (sessionCookie) {
            console.log('🍪 Session cookie found:', sessionCookie.split(';')[0]);
            testAuthCheck(sessionCookie.split(';')[0]);
          } else {
            console.log('❌ No session cookie found');
          }
        }
      } else {
        console.log('❌ Login failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Login request error:', e.message);
  });

  req.write(loginData);
  req.end();
}

function testAuthCheck(sessionCookie) {
  console.log('\n2️⃣ Testing auth check...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/check',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Auth Check Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Auth Check Response:`, data);
      
      if (res.statusCode === 200) {
        console.log('✅ Authentication working');
        try {
          const userData = JSON.parse(data);
          console.log('👤 User role:', userData.role);
          testRolesAPI(sessionCookie);
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }
      } else {
        console.log('❌ Authentication failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Auth request error:', e.message);
  });

  req.end();
}

function testRolesAPI(sessionCookie) {
  console.log('\n3️⃣ Testing roles API...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/roles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
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
      console.log(`📡 Roles API Response (first 500 chars):`);
      console.log(data.substring(0, 500));
      
      if (res.statusCode === 200) {
        console.log('✅ Roles API working correctly');
        try {
          const rolesData = JSON.parse(data);
          console.log(`📊 Found ${rolesData.length} roles`);
        } catch (e) {
          console.log('❌ Invalid JSON response from roles API');
        }
      } else if (res.statusCode === 401) {
        console.log('❌ Authentication required for roles API');
      } else if (res.statusCode === 403) {
        console.log('❌ Admin access required for roles API');
      } else if (res.statusCode === 404) {
        console.log('❌ Roles route not found');
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
        if (data.includes('<!doctype')) {
          console.log('🔍 HTML response detected - this indicates a server error or route not found');
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Roles request error:', e.message);
  });

  req.end();
}

// Wait a moment for server to start, then test
setTimeout(testCompleteFlow, 2000); 