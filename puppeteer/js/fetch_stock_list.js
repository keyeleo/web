const Logger=require('./logger');
const db=require('./dbconnector');

exports = module.exports = class FetchStockList{

	constructor(){
		// http://quote.eastmoney.com/stock_list.html
		this.page='quote.eastmoney.com/stock_list';
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

	async process(data){
		if(data){
			/*
			exchange: sz/sh
			grade: A-D
			level: 0-9, market value
			status: 0(initialized), 1(fetched), 2(terminated), 3(normal), 4(passed), 5(selected)
			*/
			let sql='CREATE TABLE summary ( \
			    id character varying(6) primary key, \
			    name character varying(10) not null, \
			    addr character varying(6), \
			    type integer, \
			    ipo timestamp(6) without time zone, \
			    exchange character varying(4), \
			    grade character varying(1), \
			    level integer default 0, \
			    status integer default 0\
			)';
			await db.query('stocks',sql);
			Logger.log('table summary created');

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
