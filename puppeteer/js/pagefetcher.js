const os=require('os');
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
const Logger=require('./logger');

class PageFetcher{
  constructor(){
    const packages=[
      './fetch_stock_list',
      './fetch_financial',
      './fetch_p2p'
    ];

    //also delete cache when reload
    delete require.cache[require.resolve('./dbconnector')];
    for(let pkg of packages)
      delete require.cache[require.resolve(pkg)];
  
    // browser path
    this.browser=null;
    this.chromePath = (os.type()=='Linux')?
        '/usr/bin/chromium-browser': ((os.type()=='Darwin')?
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':
        '');
    Logger.log('chromePath: '+this.chromePath);

    // fetchers factory
    this.fetchers=[];
    for(let i=0,ii=packages.length;i<ii;++i){
        const Fetcher=require(packages[i]);
      this.fetchers.push(new Fetcher(this));
    }
  }

  async launch(){
    // connect to browser
    if(this.browser==null){
      // connect to browser
      this.browser = await puppeteer.launch({
        executablePath: this.chromePath,
          args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-software-rasterizer',
              '--disable-gpu'
          ]
      });
    }
  }

  destroy(){
    if(this.browser)
      this.browser.close();
  }

  static async fetch(url){
    if(!this.instance){
      this.instance=new PageFetcher();
    }

    const dataPath=(os.type()=='Linux')? '/data/': '';
  
    // fix url
    const prefix='http';
    if(!(url.slice(0, prefix.length) === prefix))
      url='http://'+url;

    // open page
    Logger.log('Open page '+url);
    let page=null;
    let retry=3;
    while(--retry>0 && !page){
        await this.instance.launch();
        page = await this.instance.browser.newPage().catch(e=>{
          Logger.log('New page '+url+' error: '+e);
          this.instance.browser=null;
        });
    }
    if(!page)
      return 'Error: browser error';

    await page.goto(url,{
      timeout: 0,
      waitUntil: 'load'
    }).catch(e=>{
      Logger.log('Open page '+url+' error: '+e);
    });

    // fetch & process
    var result='Error: fetcher not found';
    const bodyHandle = await page.$('body');
    if(bodyHandle){
      for(let i=0,ii=this.instance.fetchers.length;i<ii;++i){
        let fetcher=this.instance.fetchers[i];
        if(fetcher.page && fetcher.page.length>0 && url.indexOf(fetcher.page)!=-1){
          if(fetcher.prepare)
            await fetcher.prepare(page);
          //page.evaluate 方法运行在页面内部，并返回Promise到外部
          result = await page.evaluate(fetcher.fetch, bodyHandle).catch(e=>{
            Logger.log('Evaluate '+url+' error: '+e);
          });
          if(fetcher.process)
            result=await fetcher.process(result);
          break;
        }
      }
      await bodyHandle.dispose();
    }
    await page.close();

    return result;
  }
}

exports = module.exports = PageFetcher;

