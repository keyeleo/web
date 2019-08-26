const os=require('os');
const puppeteer = require('puppeteer-core');

const chromePath = (os.type()=='Linux')?
    '/usr/bin/chromium-browser': ((os.type()=='Darwin')?
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':
    '');
const url='https://y.qq.com';
const dataPath=(os.type()=='Linux')? '/data/': '';
const imagePath=dataPath+'yqq.png';

console.log('chromePath: '+chromePath+', dataPath: '+dataPath+', imagePath: '+imagePath);

(async () => {
    const browser = await puppeteer.launch({
    	executablePath: chromePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({path: imagePath});

    browser.close();
})();
