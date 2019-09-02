const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

exports = module.exports = class FetchFinancialTrigger{

	constructor(){
		// this.page='http://stockpage.10jqka.com.cn/000876/finance/';
		this.page='www.baidu.com';
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	process(data){
		if(data){
			let codes=[600887, 601857];
			//async process list
			this.processList(codes);
		}
		return data;
	}

	async processList(codes){
		for(let code of codes){
			const url='http://quotes.money.163.com/f10/zycwzb_'+code+'.html';
	        await PageFetcher.fetch(url);
		}
	}
}
