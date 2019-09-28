const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='玖富';
		this.page='www.9fpuhui.com/optimization';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('#app > div.container > div > div.mid_content > div:nth-child(5) > div > div > div > div:nth-child(1) > div > div.el-row.r_border > div.el-col.el-col-10 > div > p');
		if(hDiv) data.m03=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#app > div.container > div > div.mid_content > div:nth-child(5) > div > div > div > div:nth-child(2) > div > div.el-row.r_border > div.el-col.el-col-10 > div > p');
		if(hDiv) data.m06=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#app > div.container > div > div.mid_content > div:nth-child(5) > div > div > div > div:nth-child(3) > div > div.el-row > div.el-col.el-col-10 > div > p');
		if(hDiv) data.m12=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#app > div.container > div > div.mid_content > div:nth-child(5) > div > div > div > div:nth-child(4) > div > div.el-row.r_border > div.el-col.el-col-10 > div > p');
		if(hDiv) data.m24=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#app > div.container > div > div.mid_content > div:nth-child(5) > div > div > div > div:nth-child(5) > div > div.el-row.r_border > div.el-col.el-col-10 > div > p');
		if(hDiv) data.m36=parse(hDiv.textContent);

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
