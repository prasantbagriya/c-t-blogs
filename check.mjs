import https from 'https';
https.get('https://chatwizs.com/portal/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data.substring(0, 500)));
});
