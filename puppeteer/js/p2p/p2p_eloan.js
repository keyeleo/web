const Logger=require('../logger');
const db=require('../dbconnector');
const PageFetcher=require('../pagefetcher');
const Utils=require('../fetch_p2p');

exports = module.exports = class FetchJiMu{

	constructor(){
		this.name='翼龙贷';
		this.page='cj.eloancn.com/ynhx/';
		this.url='https://'+this.page;
	}

	fetch(bodyHandle){
		function parse(str){
			str = str.replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/%/g,"");
			return parseFloat(str);
		}

		let data={};
		let hDiv=null;
		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(2) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.majorrate');
		if(hDiv) data.m01=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(2) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.minorrate');
		if(hDiv) data.m01+=parse(hDiv.textContent);

		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(3) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.majorrate');
		if(hDiv) data.m03=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(3) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.minorrate');
		if(hDiv) data.m03+=parse(hDiv.textContent);

		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(4) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.majorrate');
		if(hDiv) data.m06=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(4) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.minorrate');
		if(hDiv) data.m06+=parse(hDiv.textContent);

		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(1) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.majorrate');		
		if(hDiv) data.m12=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(1) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.minorrate');
		if(hDiv) data.m12+=parse(hDiv.textContent);

		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(5) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.majorrate');
		if(hDiv) data.m36=parse(hDiv.textContent);
		hDiv=bodyHandle.querySelector('#yn-list > div:nth-child(5) > div.list-txt.f-cb > div.txt-left.f-fl.godetail > div.shouYi > div > div.minorrate');
		if(hDiv) data.m36+=parse(hDiv.textContent);

		return data;
	}

	async process(data){
		return Utils.update(data,this.name);
	}
}
