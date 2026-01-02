const axios = require('axios');

async function test(platform, url) {
    console.log(`Testing ${platform} URL: ${url}`);
    try {
        const response = await axios.post(`http://localhost:3001/api/v1/extract/${platform}`, { url });
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

async function run() {
    await test('twitter', 'https://x.com/X/status/1831776957827821915');
}

run();
