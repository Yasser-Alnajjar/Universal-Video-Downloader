const axios = require('axios');

async function run() {
    // Generic video tweet: https://twitter.com/Twitter/status/1553396881954799616
    const tweetId = '1553396881954799616'; 
    const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=x`;

    console.log(`Fetching ${url}...`);
    try {
        const response = await axios.get(url, {
             headers: {
                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
             }
        });
        console.log('Success!');
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
        }
    }
}

run();
