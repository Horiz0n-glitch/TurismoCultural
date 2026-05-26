const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, 'public', 'screenshots');

async function takeScreenshot(browser, name, url, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Intercept and block external image requests to speed up
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image' && !req.url().startsWith('http://localhost')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 500));

  if (opts.fullPage) {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${name}.png`),
      fullPage: true,
    });
  } else {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${name}.png`),
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  }
  
  console.log(`✅ ${name}.png saved`);
  await page.close();
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: 'C:\\Users\\Damian\\.cache\\puppeteer\\chrome\\win64-148.0.7778.167\\chrome-win64\\chrome.exe',
  });

  try {
    // 1. Homepage - hero section (viewport crop)
    await takeScreenshot(browser, '01-homepage-hero', BASE_URL, { fullPage: false });
    
    // 2. Homepage - article grid (scroll down, full page)
    await takeScreenshot(browser, '02-homepage-articles', BASE_URL, { fullPage: true });
    
    // 3. Article page
    await takeScreenshot(browser, '03-article', `${BASE_URL}/articulo/3167-2`, { fullPage: false });
    
    // 4. Category page
    await takeScreenshot(browser, '04-category', `${BASE_URL}/categoria/eventos`, { fullPage: false });

    // 5. About page
    await takeScreenshot(browser, '05-quienes-somos', `${BASE_URL}/quienes-somos`, { fullPage: false });
    
    console.log('\n🎉 All screenshots saved to public/screenshots/');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }
})();
