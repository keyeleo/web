const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

exports = module.exports = class P2PFetcher{

	constructor(pageFetcher){
		this.url='http://127.0.0.1/echo/p2p';
		this.page='echo/p2p';
		db.destroy();

		const packages=[
			'./p2p/p2p_jimu',
			'./p2p/p2p_eloan',
			'./p2p/p2p_9fu',
			'./p2p/p2p_paipai',
			'./p2p/p2p_renren',
			'./p2p/p2p_souyi',
			'./p2p/p2p_weidai',
			'./p2p/p2p_madai',
		];

	    //also delete cache when reload
		for(let pkg of packages)
			delete require.cache[require.resolve(pkg)];

		// add sub-fetchers
		this.fetchers=[];
		for(let pkg of packages){
			const Fetcher=require(pkg);
			let fetcher=new Fetcher(pageFetcher);
			this.fetchers.push(fetcher);
			pageFetcher.fetchers.push(fetcher);
		}

		let sql='CREATE TABLE p2p ( \
			date character varying(10), \
			name character varying(10), \
		    m01 decimal(4,2), \
		    m03 decimal(4,2), \
		    m06 decimal(4,2), \
		    m12 decimal(4,2), \
		    m24 decimal(4,2), \
		    m36 decimal(4,2), \
		    primary key(date, name) \
		)';
		db.query('octopus',sql);
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	async process(data){
		for(let fetcher of this.fetchers)
			PageFetcher.fetch(fetcher.url);
		return 'Start process p2p, total='+this.fetchers.length;
	}

	static timestamp(){
		let today=new Date();
		let yyyy=today.getFullYear();
		let mm=today.getMonth()+1;
		return yyyy+'-'+(mm<10?('0'+mm):mm);
	}

	static async update(data,name){
		let timestamp=this.timestamp();
		let keys=[];
		let values=[];
		for(let key in data){
			keys.push(key);
			values.push(data[key]);
		}

		let skeys='date,name';
		let svalues='\''+timestamp+'\',\''+name+'\'';
		for(let i=0;i<keys.length;++i){
			skeys+=','+keys[i];
			svalues+=','+values[i];
		}

		let sql='INSERT INTO p2p ('+skeys+') VALUES('+svalues+')';
		let result=await db.query('octopus',sql);
		if(!result){
			let kvs='';
			for(let i=0;i<keys.length;++i){
				kvs+=keys[i]+'='+values[i];
				if(i!=keys.length-1)
					kvs+=',';
			}
			sql='UPDATE p2p SET '+kvs+' WHERE date=\''+timestamp+'\''+' AND name=\''+name+'\'';
			result=await db.query('octopus',sql);
		}

		// let keys='date,name';
		// let values='\''+timestamp+'\',\''+this.name+'\'';
		// for(let key in data){
		// 	keys+=','+key;
		// 	values+=','+data[key];
		// }
		// let sql='INSERT INTO p2p ('+keys+') VALUES('+values+')';
		// await db.query('octopus',sql);
		Logger.log(sql);
		return data;
	}
}
