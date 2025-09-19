econst fetch = require('node-fetch');

async function registerUser() {
    const url = 'http://localhost:3000/api/auth/register';
    const data = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'TestPass123'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

registerUser();
