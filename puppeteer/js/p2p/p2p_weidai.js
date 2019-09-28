const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='微贷网';
		this.page='www.weidai.com.cn/home/index/index.html';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('#app > div > div > div:nth-child(8) > div > div > ul > li:nth-child(1) > div > a > div.SafeInvest-investInfo-2dZ-p.clearfix > div.SafeInvest-leftInfo-cGDDX > span > i');
		if(hDiv) data.m01=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#app > div > div > div:nth-child(8) > div > div > ul > li:nth-child(2) > div > a > div.SafeInvest-investInfo-2dZ-p.clearfix > div.SafeInvest-leftInfo-cGDDX > span > i');
		if(hDiv) data.m03=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#app > div > div > div:nth-child(8) > div > div > ul > li:nth-child(3) > div > a > div.SafeInvest-investInfo-2dZ-p.clearfix > div.SafeInvest-leftInfo-cGDDX > span > i');
		if(hDiv) data.m06=parse(hDiv.textContent);

		return data;
	}

	async process(data){
		let keys='date,name';
		let values='\''+Utils.timestamp()+'\',\''+this.name+'\'';
		for(let key in data){
			keys+=','+key;
			values+=','+data[key];
		}
		let sql='INSERT INTO p2p ('+keys+') VALUES('+values+')';
		await db.query('octopus',sql);
		Logger.log(sql);
		return data;
	}
}
