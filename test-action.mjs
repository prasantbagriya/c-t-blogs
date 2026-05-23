import fetch from 'node-fetch';
(async () => {
  const res = await fetch('https://chatwizs.com/blog/auth/login', {
    method: 'POST',
    headers: {
      'Next-Action': '401f5392f265d14243023a1b2084364305da6b76b9',
      'Content-Type': 'text/plain;charset=UTF-8'
    },
    body: '["ChatWizs@2026!Secure"]'
  });
  console.log('Status:', res.status);
  console.log('Headers:', res.headers.raw());
  const text = await res.text();
  console.log('Body:', text);
})();
