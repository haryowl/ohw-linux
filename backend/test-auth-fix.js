const http = require('http');

function testLogin() {
  console.log('🔧 Testing login...');
  
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
    console.log(`📡 Set-Cookie:`, res.headers['set-cookie']);
    
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
            testAuthWithCookie(sessionCookie.split(';')[0]);
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

function testAuthWithCookie(sessionCookie) {
  console.log('🔧 Testing auth with cookie...');
  
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
        console.log('✅ Authentication working with cookie');
        testRolesWithCookie(sessionCookie);
      } else {
        console.log('❌ Authentication failed with cookie');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Auth request error:', e.message);
  });

  req.end();
}

function testRolesWithCookie(sessionCookie) {
  console.log('🔧 Testing roles API with cookie...');
  
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
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Roles API Response:`, data.substring(0, 200));
      
      if (res.statusCode === 200) {
        console.log('✅ Roles API working correctly');
      } else {
        console.log(`❌ Roles API failed: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Roles request error:', e.message);
  });

  req.end();
}

// Wait a moment for server to start, then test
setTimeout(testLogin, 2000); 