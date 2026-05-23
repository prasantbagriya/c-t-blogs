const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/blog/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=UTF-8',
    'Next-Action': '401f5392f265d14243023a1b2084364305da6b76b9',
    'Host': 'chatwizs.com',
    'Origin': 'https://chatwizs.com'
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Body:', data));
});

req.on('error', e => console.error(e));
req.write('["ChatWizs@2026!Secure"]');
req.end();
