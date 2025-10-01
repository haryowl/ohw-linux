const http = require('http');

function testCookie() {
  console.log('🔧 Testing cookie behavior...');
  
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
    console.log(`📡 Set-Cookie Headers:`);
    res.headers['set-cookie']?.forEach((cookie, index) => {
      console.log(`  ${index + 1}: ${cookie}`);
    });
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Login Response:`, data);
      
      if (res.statusCode === 200) {
        console.log('✅ Login successful');
        
        // Extract the actual session cookie (not the clear cookie)
        const setCookieHeaders = res.headers['set-cookie'];
        if (setCookieHeaders) {
          const sessionCookie = setCookieHeaders.find(cookie => 
            cookie.includes('sessionToken=') && !cookie.includes('Expires=Thu, 01 Jan 1970')
          );
          
          if (sessionCookie) {
            console.log('🍪 Found session cookie:', sessionCookie);
            const cookieValue = sessionCookie.split(';')[0];
            console.log('🍪 Cookie value:', cookieValue);
            testWithCookie(cookieValue);
          } else {
            console.log('❌ No valid session cookie found');
          }
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Login request error:', e.message);
  });

  req.write(loginData);
  req.end();
}

function testWithCookie(cookieValue) {
  console.log('🔧 Testing with cookie:', cookieValue);
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/check',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieValue
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
        console.log('✅ Authentication working!');
      } else {
        console.log('❌ Authentication still failing');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Auth request error:', e.message);
  });

  req.end();
}

setTimeout(testCookie, 2000); 