const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

exports = module.exports = class FetchFinancialTrigger{

	constructor(pageFetcher){
		// http://127.0.0.1/echo/financial;
		this.page='echo/financial';
		db.destroy();

		const packages=[
			'./financial/financial_main',
			'./financial/financial_balance',
			'./financial/financial_cash',
			'./financial/financial_profit',
		];

	    //also delete cache when reload
		for(let pkg of packages)
			delete require.cache[require.resolve(pkg)];

		// add sub-fetchers
		for(let pkg of packages){
			const Fetcher=require(pkg);
			pageFetcher.fetchers.push(new Fetcher());
		}
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	async process(data){
		// 沪A: sh600xxx, sh601xxx, sh603xxx
		// 深A: sz000xxx, sz002xxx
		// 创业: sz300xxx
		// This filters with status, so just use it normally when new stock published
		
		let sql='SELECT id FROM summary WHERE (status IS NULL OR status<1) AND \
(id<\'003000\' OR id>\'300000\' AND id<\'300100\' OR id>\'600000\' AND id<\'604000\') ORDER BY id';
		let res=await db.query('stocks',sql);

		let stocks=[];
		let ids=[];
		const parallel=4;
		const bundle=1+res.rows.length/parallel;
		for(let i=0,ii=res.rows.length;i<ii;++i){
			ids.push(res.rows[i].id);
			if(ids.length>=bundle || i==ii-1){
				stocks.push(ids);
				ids=[];
			}
		}		

		let count=0;
		for(let ids of stocks){
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
