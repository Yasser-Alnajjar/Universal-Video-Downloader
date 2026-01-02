const axios = require('axios');

async function test(platform, url) {
    console.log(`Testing ${platform} URL: ${url}`);
    try {
        const response = await axios.post(`http://localhost:3001/api/v1/extract/${platform}`, { url });
        console.log('Success!');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
    console.log('-----------------------------------');
}

async function run() {
    // Valid YouTube
    await test('youtube', 'https://www.youtube.com/watch?v=9-EctYee0aw');
    // Valid Twitter Video
    await test('twitter', 'https://x.com/X/status/1831776957827821915');
    // Instagram (known to be tricky)
    await test('instagram', 'https://www.instagram.com/reel/Cm8.../'); 
}

run();
