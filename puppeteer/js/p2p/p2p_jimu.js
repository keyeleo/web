const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const F10Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.url='https://box.jimu.com/Project/List';
		this.page='box.jimu.com/Project/List';
	}

	fetch(bodyHandle){
		let data={};
		data.m01=6.0;
		data.m03=6.0;
		data.m06=6.0;
		data.m12=6.0;
		data.m24=6.0;
		data.m36=6.0;
		return data;
	}

	async process(data){
		const date='201906';
		const name='积木盒子';

		let keys='date,name';
		let values=date+','+name;
		for(let key in data){
			keys+=','+key;
			values+=','+data[key];
		}
		let sql='INSERT INTO p2p ('+keys+') VALUES('+values+')';
		await db.query('octopus',sql);
		return data;
	}
}
