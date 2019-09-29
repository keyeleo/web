const Logger=require('./logger');
const db=require('./dbconnector');

exports = module.exports = class FetchHKStocks{

	constructor(){
		this.page='quote.eastmoney.com/hk/HStock_list.html';
		this.url='http://'+this.page;
		db.destroy();
	}

	fetch(bodyHandle){
		//all ul
		let ulHandle=bodyHandle.querySelector('body > div:nth-child(10) > div > ul');
		if(!ulHandle)
			return {'error':'<ul> not found when fetch stocks_hk'};
		let aHandles=ulHandle.querySelectorAll('a');
		if(!aHandles)
			return {'error':'<a> not found when fetch stocks_hk'};
		let data={};
		for(let aHandle of aHandles){
			let str=aHandle.textContent;
			if(str.indexOf(')')==6){
				const code=str.substr(str.indexOf('(')+1,5);
				const name=str.substr(str.indexOf(')')+1);
				const n=parseInt(code);
				if(n<10000){
					data[code]=name;
				}
			}
		}

		return data;
	}

	async process(data){
		if(data.error)
			return data.error;
		else{
			/*
			exchange: sz/sh
			grade: A-D
			level: 0-9, market value
			status: 0(initialized), 1(fetched), 2(delisted), 3(normal), 4(passed), 5(selected)
			*/
			let sql='CREATE TABLE summary ( \
			    id character varying(6) primary key, \
			    name character varying(30) not null, \
			    addr character varying(6), \
			    type integer, \
			    ipo timestamp(6) without time zone, \
			    exchange character varying(4), \
			    grade character varying(1), \
			    level integer default 0, \
			    status integer default 0\
			)';
			await db.query('stocks_hk',sql);
			Logger.log('table summary created');

			// let sql='INSERT INTO stock_list (code,name) VALUES(\'%s\',\'%s\')';
			for(let code in data){
				let name=data[code];
				let sql='INSERT INTO summary (id,name,exchange) VALUES(\''+code+'\',\''+name+'\',\'hk\')';
				if(db.query('stocks_hk',sql))
					Logger.log('insert '+code+": "+name);
			}
			Logger.log('Process stock list completed! total:'+data.length);
		}
		return data;
	}
}
