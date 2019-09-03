const os=require('os');
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
const Logger=require('./logger');

class PageFetcher{
  constructor(){
    //remove these when release
    delete require.cache[require.resolve('./dbconnector')];
    delete require.cache[require.resolve('./fetch_stock_list')];
    delete require.cache[require.resolve('./fetch_financial')];
    delete require.cache[require.resolve('./fetch_financial_main')];
    delete require.cache[require.resolve('./fetch_financial_balance')];
    delete require.cache[require.resolve('./fetch_financial_cash')];
    delete require.cache[require.resolve('./fetch_financial_profit')];

    // browser path
    this.browser=null;
    this.chromePath = (os.type()=='Linux')?
        '/usr/bin/chromium-browser': ((os.type()=='Darwin')?
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':
        '');
    Logger.log('chromePath: '+this.chromePath);

    // fetchers factory
    this.fetchers=[];
    const packages=[
      './fetch_stock_list',
      './fetch_financial',
      './fetch_financial_main',
      './fetch_financial_balance',
      './fetch_financial_cash',
      './fetch_financial_profit',
    ];
    for(let i=0,ii=packages.length;i<ii;++i){
        const Fetcher=require(packages[i]);
      this.fetchers.push(new Fetcher());
    }
  }

  destroy(){
    if(this.browser)
      this.browser.close();
  }

  async doFetch(url){
    if(this.browser==null){
      // connect to browser
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
  
    // fix url
    const prefix='http';
    if(!(url.slice(0, prefix.length) === prefix))
      url='http://'+url;

    // open page
    const page = await this.browser.newPage();
    await page.goto(url);

    // fetch & process
    var result='fetcher not found';
    const bodyHandle = await page.$('body');
    if(bodyHandle){
      for(let i=0,ii=this.fetchers.length;i<ii;++i){
        let fetcher=this.fetchers[i];
        if(url.indexOf(fetcher.page)!=-1){
          //page.evaluate 方法运行在页面内部，并返回Promise到外部
          result = await page.evaluate(fetcher.fetch, bodyHandle);
          if(fetcher.process)
            result=fetcher.process(result);
          break;
        }
      }
      await bodyHandle.dispose();
    }

    // await page.screenshot({path: imagePath});
    Logger.log('fetch page: '+url+', dataPath: '+dataPath+', imagePath: '+imagePath);
    return result;
  }

  static async fetch(url){
    if(!this.instance){
      this.instance=new PageFetcher();
    }
    return this.instance.doFetch(url);
  }
}

exports = module.exports = PageFetcher;

