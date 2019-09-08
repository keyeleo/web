const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

exports = module.exports = class FetchFinancialTrigger{

	constructor(){
		// this.page='http://quotes.money.163.com/stock';
		// this.page='quotes.money.163.com/stock';
		this.page='www.baidu.com';
		this.stocks=[];
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	async process(data){
		//test
		// this.processList(['000876']);
		// return 'process 000876';

		if(this.stocks.length<=0){
			let sql='SELECT id FROM summary WHERE (status IS NULL OR status<1) AND \
(id<\'001000\' OR id>\'300000\' AND id<\'300100\' OR id>\'600000\' AND id<\'604000\') ORDER BY id';
			let res=await db.query('stocks',sql);

			let ids=[];
			const parallel=4;
			const bundle=1+res.rows.length/parallel;
			for(let i=0,ii=res.rows.length;i<ii;++i){
				ids.push(res.rows[i].id);
				if(ids.length>=bundle || i==ii-1){
					this.stocks.push(ids);
					ids=[];
				}
			}		
		}

		let count=0;
		for(let ids of this.stocks){
			//async process list
			this.processList(ids);
			count+=ids.length;
		}

		return 'Start process financials, total='+count;
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
