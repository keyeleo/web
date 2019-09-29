const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='搜易贷';
		this.page='www.souyidai.com/p2p/#/invest/tbgj';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('#app > div > div:nth-child(3) > div.invest-contain > div > div.invest-project > div:nth-child(1) > div > div.list-invest-detail > div.list-summary.cf > div.lt.list-150 > div > p > span:nth-child(1)');
		if(hDiv) data.m06=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#app > div > div:nth-child(3) > div.invest-contain > div > div.invest-project > div:nth-child(1) > div > div.list-invest-detail > div:nth-child(3) > div.lt.list-150 > div > p > span:nth-child(1)');
		if(hDiv) data.m12=parse(hDiv.textContent);

		return data;
	}

	async process(data){
		return Utils.update(data,this.name);
	}
}
