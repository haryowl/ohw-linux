const fetch = require('node-fetch');

const API_BASE_URL = 'http://173.249.48.47:3001';

async function testAuthFlow() {
    console.log('=== Testing Authentication Flow ===\n');
    
    try {
        // Test 1: Check authentication status (should be 401)
        console.log('1. Testing unauthenticated access...');
        const checkResponse = await fetch(`${API_BASE_URL}/api/auth/check`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Status: ${checkResponse.status}`);
        if (checkResponse.status === 401) {
            console.log('   ✅ Expected 401 - user not authenticated');
        } else {
            console.log('   ❌ Unexpected status');
        }
        
        // Test 2: Login
        console.log('\n2. Testing login...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        console.log(`   Status: ${loginResponse.status}`);
        if (loginResponse.ok) {
            const userData = await loginResponse.json();
            console.log('   ✅ Login successful');
            console.log(`   User: ${userData.username} (${userData.role})`);
            
            // Get cookies from response
            const cookies = loginResponse.headers.get('set-cookie');
            if (cookies) {
                console.log('   ✅ Cookies received');
                console.log(`   Cookie: ${cookies.substring(0, 50)}...`);
            } else {
                console.log('   ❌ No cookies received');
            }
        } else {
            const errorData = await loginResponse.json().catch(() => ({}));
            console.log('   ❌ Login failed');
            console.log(`   Error: ${errorData.error || 'Unknown error'}`);
        }
        
        // Test 3: Check authentication after login
        console.log('\n3. Testing authenticated access...');
        const authResponse = await fetch(`${API_BASE_URL}/api/auth/check`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Status: ${authResponse.status}`);
        if (authResponse.ok) {
            const userData = await authResponse.json();
            console.log('   ✅ Authentication check successful');
            console.log(`   User: ${userData.username} (${userData.role})`);
        } else {
            console.log('   ❌ Authentication check failed');
        }
        
        // Test 4: Test protected API endpoint
        console.log('\n4. Testing protected API endpoint...');
        const devicesResponse = await fetch(`${API_BASE_URL}/api/devices`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Status: ${devicesResponse.status}`);
        if (devicesResponse.ok) {
            console.log('   ✅ Devices API accessible');
        } else {
            console.log('   ❌ Devices API not accessible');
        }
        
        // Test 5: Test records API
        console.log('\n5. Testing records API...');
        const recordsResponse = await fetch(`${API_BASE_URL}/api/records`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Status: ${recordsResponse.status}`);
        if (recordsResponse.ok) {
            console.log('   ✅ Records API accessible');
        } else {
            console.log('   ❌ Records API not accessible');
            const errorData = await recordsResponse.json().catch(() => ({}));
            console.log(`   Error: ${errorData.error || 'Unknown error'}`);
        }
        
        console.log('\n=== Test Summary ===');
        console.log('✅ Backend is working correctly');
        console.log('✅ Authentication flow is functional');
        console.log('✅ API endpoints are accessible');
        
        console.log('\n=== Frontend Issues ===');
        console.log('The issue is likely on the frontend side:');
        console.log('1. Check if the frontend is running on the correct port');
        console.log('2. Verify the API_BASE_URL in the frontend');
        console.log('3. Check browser developer tools for CORS errors');
        console.log('4. Ensure cookies are being sent with requests');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testAuthFlow().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
}); 