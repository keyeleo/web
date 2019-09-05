const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

exports = module.exports = class FetchFinancialTrigger{

	constructor(){
		// this.page='http://stockpage.10jqka.com.cn/000876/finance/';
		this.page='www.baidu.com';
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	process(data){
		this.processList(['000876']);
		return data;
		if(data){
			let sql='SELECT id FROM summary WHERE id<\'001000\' OR id>\'300000\' AND id<\'300100\' LIMIT 2';
			db.query('stocks',sql,(data)=>{
				let ids=[];
				for(let row of data.rows){
					ids.push(row.id);
				}
				//async process list
				this.processList(ids);
			});

			sql='SELECT id FROM summary WHERE id>\'600000\' AND id<\'604000\' LIMIT 2';
			db.query('stocks',sql,(data)=>{
				let ids=[];
				for(let row of data.rows){
					ids.push(row.id);
				}
				//async process list
				this.processList(ids);
			});
		}
		return data;
	}

	async processList(codes){
		for(let code of codes){
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
		return 'f10_'+((code/1000<600)?'sz':'sh');
	}
}
