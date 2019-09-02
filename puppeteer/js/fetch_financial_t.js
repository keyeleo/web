const Logger=require('./logger');
const db=require('./dbconnector');

exports = module.exports = class FetchFinancialTrigger{

	constructor(){
		// this.page='http://stockpage.10jqka.com.cn/000876/finance/';
		this.page='https://www.baidu.com';
	}

	fetch(bodyHandle){
		// let href=window.location.href;
		// let pathname=window.location.pathname;
		// return {'result':'Start fetching finanical', 'href':href, 'pathname':pathname};
		return {'result':'Start fetching finanical'};
	}

	process(data){
		if(data){
	        const PageFetcher=require('./pagefetcher');
			let codes=[600887, 601857];
			for(let code of codes){
				const url='http://quotes.money.163.com/f10/zycwzb_'+code+'.html';
		        PageFetcher.fetch(url);
			}
		}
		return data;
	}
}
