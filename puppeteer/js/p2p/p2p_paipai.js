const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='拍拍贷';
		this.page='tz.ppdai.com/resplendent/list';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('body > div:nth-child(1) > div:nth-child(2) > div > div.content-container > div > div:nth-child(5) > div > div.summary.flex-space-between > div:nth-child(1) > div.rate-title.margin-b');
		if(hDiv) data.m01=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div:nth-child(1) > div:nth-child(2) > div > div.content-container > div > div:nth-child(6) > div > div.summary.flex-space-between > div:nth-child(1) > div.rate-title.margin-b');
		if(hDiv) data.m03=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div:nth-child(1) > div:nth-child(2) > div > div.content-container > div > div:nth-child(11) > div > div.summary.flex-space-between > div:nth-child(1) > div.rate-title.margin-b');
		if(hDiv) data.m06=parse(hDiv.textContent);

		return data;
	}

	async process(data){
		return Utils.update(data,this.name);
	}
}
