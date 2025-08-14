const axios = require('axios');

async function debugSession() {
    try {
        console.log('Debugging session...');
        
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
        console.log('Cookies received:', cookies);
        
        // Extract the session token from the cookie
        const sessionCookie = cookies?.find(cookie => cookie.includes('sessionToken=') && !cookie.includes('Expires=Thu, 01 Jan 1970'));
        if (sessionCookie) {
            console.log('Found session cookie:', sessionCookie);
            const tokenMatch = sessionCookie.match(/sessionToken=([^;]+)/);
            if (tokenMatch) {
                const token = tokenMatch[1];
                console.log('Session token extracted:', token);
                
                try {
                    // Test auth check with the token
                    console.log('\n2. Testing auth check with token...');
                    const checkResponse = await axios.get('http://173.249.48.47:3001/api/auth/check', {
                        withCredentials: true,
                        headers: {
                            'Cookie': `sessionToken=${token}`
                        }
                    });
                    
                    console.log('Auth check successful:', checkResponse.data);
                    
                    // Test users endpoint with the token
                    console.log('\n3. Testing users endpoint with token...');
                    const usersResponse = await axios.get('http://173.249.48.47:3001/api/users', {
                        withCredentials: true,
                        headers: {
                            'Cookie': `sessionToken=${token}`
                        }
                    });
                    
                    console.log('Users API successful:', usersResponse.data);
                } catch (error) {
                    console.error('Error in auth check or users API:', error.response?.data || error.message);
                    console.error('Status:', error.response?.status);
                }
            } else {
                console.log('Could not extract token from cookie');
            }
        } else {
            console.log('No sessionToken cookie found');
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

debugSession(); 