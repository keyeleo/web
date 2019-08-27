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

    console.log('df='+this.dataFetcher+', ug='+this.urlGenerator);
    this.dataFetcher.fetch();
    this.urlGenerator.generate();

    await page.evaluate(()=>{
      console.log('df='+this.dataFetcher+', ug='+this.urlGenerator+', document='+document);
      // dataFetcher.fetch(document);
      // urlGenerator.generate(document);
    });
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

