const os=require('os');
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
// const DataFetch=require('./datafetcher');
// const UrlGenerator=require('./urlgenerator');

class PageFetcher{
  constructor(){
    this.browser=null;
    this.chromePath = (os.type()=='Linux')?
        '/usr/bin/chromium-browser': ((os.type()=='Darwin')?
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':
        '');
    console.log('chromePath: '+this.chromePath);

    delete require.cache[require.resolve('./datafetcher')];
    delete require.cache[require.resolve('./urlgenerator')];
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

    //page.evaluate 方法运行在页面内部，并返回Promise到外部
    const bodyHandle = await page.$('body');
    const result = await page.evaluate((bodyHandle) => {
      let divList = [];
      let stockList = [];

      //all div
      let divHandles=bodyHandle.querySelectorAll('div');
      for(let divHandle of divHandles){
        let divObj={'id':divHandle.id, 'class':divHandle.class};
        divList.push(divObj);
      }

      //涨幅榜
      let cnltContentHandle=bodyHandle.querySelector('#cnlt_contents');
      let tbodyHandle=cnltContentHandle.querySelector('tbody');
      let trHandles=tbodyHandle.querySelectorAll('tr');
      for(let trHandle of trHandles){
        let stock=[];
        let thHandles=trHandle.querySelectorAll('th');
        stock.push(thHandles[0].textContent);
        stock.push(thHandles[1].textContent);

        let tdHandles=trHandle.querySelectorAll('td');
        for(let td of tdHandles){
          stock.push(td.textContent);
        }
        stockList.push(stock);
      }

      return {'div':divList, 'stocks':stockList};
    }, bodyHandle);
    await bodyHandle.dispose();
    console.log(result);

    // await page.screenshot({path: imagePath});
    console.log('fetch page: '+url+', dataPath: '+dataPath+', imagePath: '+imagePath);
  }
}

class FetcherHelper{
  log(){
    console.log('helper');
  }
}

exports = module.exports = PageFetcher;
exports.Helper = FetcherHelper;

