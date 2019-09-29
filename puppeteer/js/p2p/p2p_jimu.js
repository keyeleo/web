const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='积木盒子';
		this.page='box.jimu.com/Venus/List';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('body > div.container.venus-container > div.project-container > div > a:nth-child(11) > div > div.info > div.rate > div.num.invest-item-profit');
		if(hDiv) data.m01=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div.container.venus-container > div.project-container > div > a:nth-child(2) > div > div.info > div.rate > div.num.invest-item-profit');
		if(hDiv) data.m03=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div.container.venus-container > div.project-container > div > a:nth-child(3) > div > div.info > div.rate > div.num.invest-item-profit');
		if(hDiv) data.m06=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('body > div.container.venus-container > div.project-container > div > a:nth-child(6) > div > div.info > div.rate > div.num.invest-item-profit');
		if(hDiv) data.m12=parse(hDiv.textContent);

		return data;
	}

	async process(data){
		return Utils.update(data,this.name);
	}
}
