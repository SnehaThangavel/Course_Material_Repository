const axios = require('axios');

async function check() {
    try {
        console.log('Checking /api/notifications endpoint...');
        // We'd need an auth token to really test it, but we can check if it returns 401 instead of 404
        const res = await axios.get('http://127.0.0.1:5000/api/notifications').catch(e => e.response);
        if (res && res.status === 401) {
            console.log('✅ Endpoint exists and is protected (Returned 401)');
        } else if (res && res.status === 404) {
            console.log('❌ Endpoint NOT found (Returned 404)');
        } else {
            console.log('Unexpected response:', res ? res.status : 'No response');
        }
    } catch (e) {
        console.error('Check failed:', e.message);
    }
}

check();
