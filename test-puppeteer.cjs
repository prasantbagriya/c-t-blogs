const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Track responses to see cookies
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/blog/auth/login') && response.request().method() === 'POST') {
      console.log('[POST Response Headers]:', response.headers());
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://127.0.0.1:3001/blog/auth/login', { waitUntil: 'networkidle2' });
  
  console.log('Typing password...');
  await page.type('input[type="password"]', 'ChatWizs@2026!Secure');
  
  console.log('Clicking submit...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]')
  ]);
  
  console.log('Current URL after submit:', page.url());
  const cookies = await page.cookies();
  console.log('Cookies:', cookies);
  
  await browser.close();
})();
