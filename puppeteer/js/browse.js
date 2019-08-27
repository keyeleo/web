const os=require('os');
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');

const dataPath=(os.type()=='Linux')? '/data/': '';
const imagePath=dataPath+'screenshot.png';

// exports = module.exports = browse;

module.exports = function (url){
  const PageFetcher=require('./pagefetcher');
  const pageFetcher=new PageFetcher();
  pageFetcher.fetch('www.baidu.com');
  let helper=new PageFetcher.Helper();
  helper.log();

  const prefix='http';
  if(!(url.slice(0, prefix.length) === prefix))
    url='http://'+url;
  const chromePath = (os.type()=='Linux')?
      '/usr/bin/chromium-browser': ((os.type()=='Darwin')?
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':
      '');

  console.log('url: '+url+', chromePath: '+chromePath+', dataPath: '+dataPath+', imagePath: '+imagePath);

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
}
  