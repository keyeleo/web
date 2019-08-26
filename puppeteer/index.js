const puppeteer = require('puppeteer-core');

console.log('hello puppeteer');

(async () => {
    const browser = await puppeteer.launch({
    	executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    	// executablePath: '/usr/bin/chromium-browser',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    // const browser = await puppeteer.launch();
    // const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
    // const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page = await browser.newPage();
    await page.goto('https://y.qq.com');
    await page.screenshot({path: 'yqq.png'});
    // await page.screenshot({path: '/data/yqq.png'});
	console.log('world puppeteer');
    browser.close();
})();
