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
			date character varying(10) primary key, \
			name character varying(10) not null, \
		    m01 decimal(4,2), \
		    m03 decimal(4,2), \
		    m06 decimal(4,2), \
		    m12 decimal(4,2), \
		    m24 decimal(4,2), \
		    m36 decimal(4,2) \
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
}
