const axios = require('axios');

async function testAuth() {
    try {
        console.log('Testing authentication...');
        
        // Test login
        console.log('\n1. Testing login...');
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
        
        // Test auth check
        console.log('\n2. Testing auth check...');
        const checkResponse = await axios.get('http://173.249.48.47:3001/api/auth/check', {
            withCredentials: true,
            headers: {
                'Cookie': loginResponse.headers['set-cookie']?.join('; ') || ''
            }
        });
        
        console.log('Auth check successful:', checkResponse.data);
        
        // Test devices endpoint
        console.log('\n3. Testing devices endpoint...');
        const devicesResponse = await axios.get('http://173.249.48.47:3001/api/devices', {
            withCredentials: true,
            headers: {
                'Cookie': loginResponse.headers['set-cookie']?.join('; ') || ''
            }
        });
        
        console.log('Devices endpoint successful:', devicesResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
    }
}

testAuth(); 