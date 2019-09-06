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

		let sql='SELECT id FROM summary WHERE id<\'001000\' OR id>\'300000\' AND id<\'300100\' OR id>\'600000\' AND id<\'604000\' ORDER BY id';
		let res=await db.query('stocks',sql);

		var ids=[];
		const parallel=8;
		const bundle=1+res.rows.length/parallel;
		for(let i=0,ii=res.rows.length;i<ii;++i){
			ids.push(res.rows[i].id);
			if(ids.length>=bundle || i==ii-1){
				//async process list
				this.processList(ids);
				ids=[];
			}
		}
		return {'total': res.rows.length};
	}

	async processList(ids){
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
