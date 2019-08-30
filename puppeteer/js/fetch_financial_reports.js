const Logger=require('./logger');

exports = module.exports = class FetchFinancialReports{

	constructor(){
		this.page='data.eastmoney.com/bbsj/yjbb';
	}

	fetch(bodyHandle){
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
	}
}
