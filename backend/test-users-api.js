const axios = require('axios');

async function testUsersAPI() {
    try {
        console.log('Testing users API...');
        
        // First, login to get a session
        console.log('\n1. Logging in...');
        const loginResponse = await axios.post('http://173.249.48.47:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Login successful');
        const cookies = loginResponse.headers['set-cookie'];
        console.log('Cookies:', cookies);
        
        // Test users endpoint
        console.log('\n2. Testing users endpoint...');
        const usersResponse = await axios.get('http://173.249.48.47:3001/api/users', {
            withCredentials: true,
            headers: {
                'Cookie': cookies?.join('; ') || ''
            }
        });
        
        console.log('Users API response status:', usersResponse.status);
        console.log('Users found:', usersResponse.data.length);
        usersResponse.data.forEach(user => {
            console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Active: ${user.isActive}`);
        });
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        if (error.response?.headers) {
            console.error('Response headers:', error.response.headers);
        }
    }
}

testUsersAPI(); 