const Logger=require('./logger');

exports = module.exports = class DataFetcher{

	constructor(){
		this.fetchers=[];
		const packages=[
			'./fetch_stock_list',
			'./fetch_financial_reports',
		];
		for(let i=0,ii=packages.length;i<ii;++i){
		    const Fetcher=require(packages[i]);
			this.fetchers.push(new Fetcher());
		}
	}

	async fetch(page){
	    let result='fetcher not found';
	    const bodyHandle = await page.$('body');
	    if(bodyHandle){
	    	const url=page.url();
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
	    return result;
	}
}
