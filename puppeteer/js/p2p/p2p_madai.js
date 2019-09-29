const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='麻袋';
		this.page='www.madailicai.com/plan/list/#list-main';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('body > div.list-container > div.main1080.list-conent > div.panel.panel-primary.list-tab > div.panle-body.list-tab-content > ul > li:nth-child(1) > div.flex-column > div:nth-child(1) > p.rate > em');
		if(hDiv) data.m01=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div.list-container > div.main1080.list-conent > div.panel.panel-primary.list-tab > div.panle-body.list-tab-content > ul > li:nth-child(2) > div.flex-column > div:nth-child(1) > p.rate > em');
		if(hDiv) data.m03=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div.list-container > div.main1080.list-conent > div.panel.panel-primary.list-tab > div.panle-body.list-tab-content > ul > li:nth-child(3) > div.flex-column > div:nth-child(1) > p.rate > em');
		if(hDiv) data.m06=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div.list-container > div.main1080.list-conent > div.panel.panel-primary.list-tab > div.panle-body.list-tab-content > ul > li:nth-child(4) > div.flex-column > div:nth-child(1) > p.rate > em');
		if(hDiv) data.m12=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div.list-container > div.main1080.list-conent > div.panel.panel-primary.list-tab > div.panle-body.list-tab-content > ul > li:nth-child(5) > div.flex-column > div:nth-child(1) > p.rate > em');
		if(hDiv) data.m24=parse(hDiv.textContent);

		return data;
	}

	async process(data){
		return Utils.update(data,this.name);
	}
}
