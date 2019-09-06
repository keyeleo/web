const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

exports = module.exports = class FetchFinancialTrigger{

	constructor(){
		// this.page='http://quotes.money.163.com/stock';
		this.page='quotes.money.163.com/stock';
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	async process(data){
		// //test
		// let dd={'rows':[{'id':'000876'}]};
		// this.processList(dd);
		// return 'process 000876';

		let sql='SELECT id FROM summary WHERE id<\'001000\' OR id>\'300000\' AND id<\'300100\' ORDER BY id';
		let res=await db.query('stocks',sql);
		data={'sz': res.rows.length};
		//async process list
		this.processList(res);

		sql='SELECT id FROM summary WHERE id>\'600000\' AND id<\'604000\' ORDER BY id';
		res=await db.query('stocks',sql);
		data.sh=res.rows.length;
		//async process list
		this.processList(res);

		return data;
	}

	async processList(data){
		let ids=[];
		for(let row of data.rows){
			ids.push(row.id);
		}
		for(let code of ids){
			const url='http://quotes.money.163.com/f10/zycwzb_'+code+'.html';
	        await PageFetcher.fetch(url);
		}
	}
}

exports.Code2=class _Utils{
	static table(code){
		return 'f10_'+code;
	}

	static db(code){
		return 'f10';
		// return 'f10_'+((code/1000<600)?'sz':'sh');
	}
}
