exports = module.exports = class DataFetcher{

	constructor(){
		this.fetchers=[];
		const packages=[
			'./fetch_stock_list',
			'./fetch_financial_reports',
		];
		for(let i=0,ii=packages.length;i<ii;++i){
		    delete require.cache[require.resolve(packages[i])];
		    const Fetcher=require(packages[i]);
			this.fetchers.push(new Fetcher());
		}
	}

	connect(){
		const pg=require('pg')
		var conString = "postgres://vic:liu@code.biad.com.cn:39008/stocks";
		var client = new pg.Client(conString);
		client.connect(function(err) {
		    if(err) {
		      return console.error('连接postgreSQL数据库失败', err);
		    }
		    client.query('SELECT * FROM summary', function(err, data) {
		      if(err) {
		        return console.error('查询失败', err);
		      }else{
		        // console.log('成功',data.rows); 
		        console.log('成功',JSON.stringify(data.rows)); 
		      }
		      client.end();
		    });
		});
	}

	async fetch(page){
		// this.connect();
	    let result='fetcher not found';
	    const bodyHandle = await page.$('body');
	    if(bodyHandle){
	    	const url=page.url();
	    	for(let i=0,ii=this.fetchers.length;i<ii;++i){
	    		let fetcher=this.fetchers[i];
	    		if(url.indexOf(fetcher.page)!=-1){
				    //page.evaluate 方法运行在页面内部，并返回Promise到外部
				    result = await page.evaluate(fetcher.fetch, bodyHandle);
				    break;
	    		}
			}
		    await bodyHandle.dispose();
	    }
	    return result;
	}
}
