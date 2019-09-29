const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='人人贷';
		this.page='www.renrendai.com/';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('body > div.main-content > div.compliance-uplan > div.index-uplan-box.clearfix > div.p-rate > div:nth-child(1)');
		if(hDiv) data.m12=parse(hDiv.textContent);

		return data;
	}

	async process(data){
		return Utils.update(data,this.name);
	}
}
