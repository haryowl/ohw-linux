const axios = require('axios');

async function testAuth() {
    try {
        console.log('Testing authentication...');
        
        // Test login
        const loginResponse = await axios.post('http://173.249.48.47:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Login successful:', loginResponse.data);
        console.log('Cookies received:', loginResponse.headers['set-cookie']);
        
        // Extract cookies
        const cookies = loginResponse.headers['set-cookie'];
        if (cookies && cookies.length > 0) {
            console.log('\nCookie details:');
            cookies.forEach((cookie, index) => {
                console.log(`Cookie ${index + 1}:`, cookie);
            });
            
            // Test API call with cookies
            const apiResponse = await axios.get('http://173.249.48.47:3001/api/devices', {
                headers: {
                    'Cookie': cookies.join('; ')
                }
            });
            
            console.log('\nAPI call successful:', apiResponse.data);
        } else {
            console.log('No cookies received from login');
        }
        
    } catch (error) {
        console.error('Error:', error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
        } : error.message);
    }
}

testAuth(); 