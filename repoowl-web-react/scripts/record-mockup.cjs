const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

// Use stealth plugin to bypass Google's automation detection
puppeteer.use(StealthPlugin());

(async () => {
  const extensionPath = path.resolve(__dirname, '../../extension');
  const authDir = path.resolve(__dirname, 'mockup_profile'); // Creates a local profile to persist login

  console.log('--- Launching Microsoft Edge (Stealth Mode) ---');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false,
    userDataDir: authDir, 
    defaultViewport: null,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating to GitHub...');
  await page.goto('https://github.com/login');

  // If the user is at the login page, we wait.
  if (page.url().includes('login')) {
      console.log('!!! ACTION REQUIRED !!!');
      console.log('Please log in to GitHub. You can safely use "Sign in with Google" now.');
      console.log('Waiting for you to reach the dashboard...');
      
      // Wait for the user avatar element which indicates successful login
      await page.waitForFunction(() => document.querySelector('.AppHeader-user') !== null, { timeout: 0 });
      console.log('Login confirmed!');
  }

  console.log('Starting video recorder...');
  const recorder = new PuppeteerScreenRecorder(page);
  const savePath = path.resolve(__dirname, '../public/assets/repoowl-demo.mp4');
  await recorder.start(savePath);

  console.log('Navigating to New Issue page...');
  await page.goto('https://github.com/YASHK-arch/RepoOwl-extension/issues/new');

  console.log('Simulating human typing...');
  await page.waitForSelector('#issue_title', { timeout: 10000 });
  await page.type('#issue_title', 'Bug: Application crashes when offline', { delay: 100 });
  
  await page.waitForSelector('#issue_body', { timeout: 10000 });
  await page.type('#issue_body', 'When I disconnect from the internet and try to log in, the extension throws a fatal error instead of a graceful message.', { delay: 50 });

  console.log('Waiting for RepoOwl AI to kick in (4s)...');
  await new Promise(r => setTimeout(r, 4000));

  console.log('Zooming in dynamically for professional mockup effect...');
  // Smoothly zoom in on the page to show the extension using CSS zoom
  await page.evaluate(async () => {
      let zoom = 1.0;
      return new Promise(resolve => {
          let interval = setInterval(() => {
              zoom += 0.01;
              document.body.style.zoom = zoom;
              
              // Smoothly scroll down a bit as we zoom to keep things centered
              window.scrollBy(0, 5); 

              if (zoom >= 1.4) {
                  clearInterval(interval);
                  resolve();
              }
          }, 30); 
      });
  });

  console.log('Holding the zoomed view for 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Finalizing recording...');
  await recorder.stop();
  await browser.close();

  console.log('✅ Mockup recorded successfully with cinematic zoom!');
  console.log('Video saved to: ' + savePath);
})();
