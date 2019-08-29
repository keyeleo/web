exports = module.exports = class DataFetcher{

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
		this.connect();
	    //page.evaluate 方法运行在页面内部，并返回Promise到外部
	    let result='body not found';
	    const bodyHandle = await page.$('body');
	    if(bodyHandle){
		    result = await page.evaluate((bodyHandle) => {
		      let divList = [];
		      let stockList = [];

		      //all div
		      // let divHandles=bodyHandle.querySelectorAll('div');
		      // for(let divHandle of divHandles){
		      //   let divObj={'id':divHandle.id, 'class':divHandle.class};
		      //   divList.push(divObj);
		      // }

		      //涨幅榜
		      let cnltContentHandle=bodyHandle.querySelector('#cnlt_contents');
		      if(cnltContentHandle==null){
		      	return 'cnlt_contents not found';
		      }
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
	    }
	    return result;
	}
}
