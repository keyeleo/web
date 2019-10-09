const Logger=require('./logger');
const db=require('./dbconnector');

exports = module.exports = class FetchUSStocks{

	constructor(){
		this.page='vip.stock.finance.sina.com.cn/usstock/ustotal.php';
		this.url='http://'+this.page;
		this.stocks='stocks_us';
		db.destroy();
	}

	fetch(bodyHandle){
		//all ul
		let ulHandle=bodyHandle.querySelector('#cp_list');
		if(!ulHandle)
			return {'error':'<ul> not found when fetch '+this.stocks};
		let aHandles=ulHandle.querySelectorAll('a');
		if(!aHandles)
			return {'error':'<a> not found when fetch '+this.stocks};
		let data={};
		for(let aHandle of aHandles){
			let str=aHandle.textContent;
			if(str.indexOf(')')>0){
				const i0=str.indexOf('(');
				const code=str.substring(i0+1,str.indexOf(')'));
				const name=str.substring(0,i0);
				if(code.length>0 && name.length>0){
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
			exchange: us
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
			await db.query(this.stocks,sql);
			Logger.log('table summary created');

			// let sql='INSERT INTO stock_list (code,name) VALUES(\'%s\',\'%s\')';
			for(let code in data){
				let name=data[code];
				let sql='INSERT INTO summary (id,name,exchange) VALUES(\''+code+'\',\''+name+'\',\'us\')';
				if(db.query(this.stocks,sql))
					Logger.log('insert '+code+": "+name);
			}
			Logger.log('Process stock list completed! total:'+data.length);
		}
		return data;
	}
}
