const Logger=require('./logger');
const db=require('./dbconnector');

exports = module.exports = class FetchStockList{

	constructor(){
		// Done
		// this.page='quote.eastmoney.com/stock_list';
	}

	fetch(bodyHandle){
		let data={};

		//all ul
		let ulHandles=bodyHandle.querySelectorAll('ul');
		if(!ulHandles)
			return '<ul> not found when fetch stock_list';
		for(let ulHandle of ulHandles){
			// exchange list
			let liHandles=ulHandle.querySelectorAll('li');
			if(!liHandles)
				continue;

			// exchange: sh or sz
			let ex=null;
			let aNameHandle=ulHandle.querySelector('a');
			if(aNameHandle)
				ex=aNameHandle.name;
			if(!ex)
				continue;

			// stocks list
			let stockList = [];
			for(let liHandle of liHandles){
				let aHandle=liHandle.querySelector('a[href]');
				if(aHandle){
					let str=aHandle.textContent;
					let code=str.substr(str.indexOf('(')+1,6);
					let name=str.substr(0,str.indexOf('('));
					let stock={};
					stock[code]=name;
					stockList.push(stock);
				}
			}

			// data[ex+'_count']=liHandles.length;
			data[ex]=stockList;
		}

		return data;
	}

	process(data){
		if(data){
			// let sql='INSERT INTO stock_list (code,name) VALUES(\'%s\',\'%s\')';
			for(let ex in data){
				let stockList=data[ex];
				for(let stock of stockList){
					for(let code in stock){
						let name=stock[code];
						Logger.log(code+": "+name);
						let sql='INSERT INTO summary (id,name,exchange) VALUES(\''+code+'\',\''+name+'\',\''+ex+'\')';
						db.query('stocks',sql);
						break;
					}
				}
			}
			Logger.log('Process stock list completed!');
		}
		return data;
	}
}
