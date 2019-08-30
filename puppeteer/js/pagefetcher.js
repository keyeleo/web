const os=require('os');
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
const Logger=require('./logger');

class PageFetcher{
  constructor(){
    //remove these when release
    // delete require.cache[require.resolve('./datafetcher')];
    // delete require.cache[require.resolve('./urlgenerator')];
    delete require.cache[require.resolve('./dbconnector')];
    delete require.cache[require.resolve('./fetch_stock_list')];
    // delete require.cache[require.resolve('./fetch_financial_reports')];

    this.browser=null;
    this.chromePath = (os.type()=='Linux')?
        '/usr/bin/chromium-browser': ((os.type()=='Darwin')?
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':
        '');
    Logger.log('chromePath: '+this.chromePath);

    const DataFetch=require('./datafetcher');
    const UrlGenerator=require('./urlgenerator');

    this.dataFetcher=new DataFetch();
    this.urlGenerator=new UrlGenerator();
  }

  destroy(){
    if(this.browser)
      this.browser.close();
  }

  async fetch(url){
    if(this.browser==null){
      this.browser = await puppeteer.launch({
        executablePath: this.chromePath,
          args: [
              '--no-sandbox',
              '--disable-setuid-sandbox'
          ]
      });
    }

    const dataPath=(os.type()=='Linux')? '/data/': '';
    const imagePath=dataPath+'screenshot.png';
  
    const prefix='http';
    if(!(url.slice(0, prefix.length) === prefix))
      url='http://'+url;

    const page = await this.browser.newPage();
    await page.goto(url);

    await this.urlGenerator.generate(page);
    const result=await this.dataFetcher.fetch(page);

    // await page.screenshot({path: imagePath});
    Logger.log('fetch page: '+url+', dataPath: '+dataPath+', imagePath: '+imagePath);
    return result;
  }
}

class FetcherHelper{
  log(){
    Logger.log('helper');
  }
}

exports = module.exports = PageFetcher;
exports.Helper = FetcherHelper;

