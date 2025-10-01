const http = require('http');

function testUserPermissions() {
  console.log('🔧 Testing user permissions...');
  
  // First, login to get a session cookie
  const loginData = JSON.stringify({
    username: 'haryow',
    password: 'haryow123'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
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
            
            // Now test the auth check endpoint
            testAuthCheck(cookieValue);
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

function testAuthCheck(cookieValue) {
  console.log('🔧 Testing auth check with cookie...');
  
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
        try {
          const userData = JSON.parse(data);
          console.log('✅ User data parsed successfully');
          console.log('🔍 User permissions structure:', {
            role: userData.role,
            roleId: userData.roleId,
            permissions: userData.permissions,
            permissionsType: typeof userData.permissions,
            hasMenus: !!userData.permissions?.menus,
            menusType: typeof userData.permissions?.menus,
            isArray: Array.isArray(userData.permissions?.menus)
          });
        } catch (e) {
          console.log('❌ Failed to parse user data:', e.message);
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Auth request error:', e.message);
  });

  req.end();
}

setTimeout(testUserPermissions, 2000); 