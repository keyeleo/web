exports = module.exports = class DataFetcher{

	async fetch(page){
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
	}
}
