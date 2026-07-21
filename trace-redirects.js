import https from 'https';

function fetchUrl(url, depth = 0) {
    if (depth > 10) {
        console.log("Max redirect depth reached.");
        return;
    }
    console.log(`\nFetching: ${url}`);
    https.get(url, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
            let nextUrl = res.headers.location;
            if (nextUrl.startsWith('/')) {
                const urlObj = new URL(url);
                nextUrl = `${urlObj.protocol}//${urlObj.host}${nextUrl}`;
            }
            fetchUrl(nextUrl, depth + 1);
        }
    }).on('error', (e) => {
        console.error("Error:", e.message);
    });
}

fetchUrl('https://chatwizs.com/blog');
