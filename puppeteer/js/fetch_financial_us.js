const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

class Fetcher{
	constructor(pageFetcher){
		this.page='stockpage.10jqka.com.cn/';
		this.url='http://'+this.page+'_code_/finance/';
		this.stocks='stocks_us';
	}

	async prepare(page){
		//wait for data loaded
		await this.sleep(1000);
	}

	fetch(bodyHandle){
		//window.location.pathname=/GOOG/finance/
		let code=window.location.pathname.substring(1,window.location.pathname.indexOf('/',1));
		var data={};

		//head or title
		let hFrame=bodyHandle.querySelector('#dataIFrame');
		if(!hFrame)
			return {'code':code, 'error':'<dataIFrame> not found when fetch stocks_us'};
		let dom=hFrame.contentDocument;
		let keyindex=dom.querySelector('#keyindex');
		if(!keyindex)
			return {'code':code, 'error':'<keyindex> not found when fetch stocks_us'};
		let benefit=dom.querySelector('#benefit');
		if(!benefit)
			return {'code':code, 'error':'<benefit> not found when fetch stocks_us'};
		let debt=dom.querySelector('#debt');
		if(!debt)
			return {'code':code, 'error':'<debt> not found when fetch stocks_us'};
		let cash=dom.querySelector('#cash');
		if(!cash)
			return {'code':code, 'error':'<cash> not found when fetch stocks_us'};

		return {'code': code, 'data':{
			'keyindex': keyindex.textContent,
			'benefit': benefit.textContent,
			'debt': debt.textContent,
			'cash': cash.textContent,
		}};
	}

	parse(Data){
		function initData(period){
			let data={};
			data.period=period;
			data.sc=0;
			data.ta=0;
			data.tl=0;
			data.ca=0;
			data.ivt=0;
			data.tr=0;
			data.ap=0
			data.dr=0;
			data.adv=0;
			data.cl=0;
			data.gr=0;
			data.cor=0;
			data.np=0;
			data.npas=0;
			data.npc=0;
			data.gm=0;
			data.pm=0;
			data.ocf=0;
			data.icf=0;
			data.fcf=0;
			data.roe=0;
			data.roa=0;
			data.cr=0;
			data.atr=0;
			data.ocfr=0;
			data.er=0;
			data.ato=0;
			data.ito=0;
			data.rto=0;
			return data;
		}

		let indicators={
			// 'sc': '',
			'ta': '资产总额(元)',
			'tl': '负债总额(元)',
			'ca': '流动资产合计',
			'cl': '流动负债合计',
			'ivt': '存货',
			'tr': '应收账款及票据',
			// 'dr': '',
			'adv': '预付款项、按金及其他应收款项(流动)',
			'gr': '营业收入(计算)',
			'cor': '销售成本',
			'np': '净利润',
			'npas': '本公司拥有人应占净利润',
			// 'npc': '',
			'gm': '毛利率(%)',
			'pm': '净利率(%)',
			'ocf': '经营活动产生的现金流量净额',
			'icf': '投资活动产生的现金流量净额',
			'fcf': '融资活动产生的现金流量净额',
			'roe': '平均净资产收益率(%)',
			'roa': '总资产净利率(%)',
			'cr': '流动比率',
			// 'atr': '',
			// 'ocfr': '',
			// 'er': '',
			// 'ato': '',
			// 'ito': '',
			// 'rto': '',
			'eps': '基本每股收益(元)',
			'eas': '归属于母公司股东权益',
		};

		function parseTable(tb,report){
			for(let i=1;i<tb.title.length;++i){
				let title=tb.title[i][0];
				let unit=tb.title[i][1];
				let data=tb.report[i];
				if(unit.substring(0,2)=='百万'){
					// for(let j=0;j<data.length;++j){
					// 	data[j]*=100;
					// }
				}

				report[title]=data;
				Logger.log(title);
			}
		}

		function fill(rowsMap,field,name){
			// let hta=handles[idx];
			let hta=rowsMap[name];
			if(!hta){
				if(field=='cor')
					hta=rowsMap['营业支出(计算)'];
				else if(field=='gr')
					hta=rowsMap['营业总收入(元)'];
				else if(field=='ca')
					hta=rowsMap['现金及现金等价物'];
			}
			if(!hta){
				for(let key in rowsMap){
					if(name.indexOf(key)>=0){
						hta=rowsMap[key];
						break;
					}
				}
				if(!hta){
					if(field=='adv' || field=='ivt' || field=='cor' || field=='tr' || field=='icf' || field=='fcf')
						return true;
					if(field=='ca' || field=='cl' || field=='tr'){
						for(let key in rowsMap){
							//bank or ensurance
							if(key=='现金、存放同业和其他金融机构款项' || key=='保险负债总额'){
								return true;
							}
						}
					}
					return false;
				}
			}

			for(let svalue of hta){
				let value=parseFloat(svalue);
				if(field!='roe' && field!='roa' && field!='pm' && field!='gm')
					value/=1000000;	//=>1m
				if(field=='ta' || field=='tl' || field=='ca' || field=='cl')
					value/=100;		//=>100m

				let d=data[i-1];
				if(value)
					d[field]=value;
			}	
			return true;	
		}

		let keyindex=JSON.parse(Data.keyindex);
		let benefit=JSON.parse(Data.benefit);
		let debt=JSON.parse(Data.debt);
		let cash=JSON.parse(Data.cash);
		let report={};
		parseTable(keyindex,report);
		// parseTable(benefit,report);
		// parseTable(debt,report);
		// parseTable(cash,report);

		for(let ik in indicators){
			let indicator=indicators[ik];
			if(!fill(report, ik, indicator))
				return {'code':code, 'error': code+': '+indicator+' error'};
		}

		var data={};
		return data;
	}

	async process(Data,url){
		if(Data){
			let code=Data.code;
			let data=this.parse(Data.data);
			if(code && data){
				// let res=await this.createTable(code);
				// if(res){
				// 	for(let i=0;i<data.length;++i){
				// 		let d=data[i];
				// 		if(d.eps!=0)
				// 			d.sc=Math.ceil(d.npas/d.eps/10000);
				// 		if(d.cl!=0)
				// 			d.cr=d.ca/d.cl;
				// 		if(d.eas!=0){
				// 			d.er=d.tl*100/d.eas;
				// 			if(d.er>999999)d.er=999999;
				// 			if(d.er<-999999)d.er=-999999;
				// 		}
				// 		if(d.cl!=0){
				// 			d.ocfr=d.ocf/d.cl;
				// 			if(d.ocfr>99999)d.ocfr=99999;
				// 			if(d.ocfr<-99999)d.ocfr=-99999;
				// 		}
				// 		if(i==data.length-1){
				// 			if(d.ta!=0){
				// 				d.ato=d.gr/d.ta;
				// 			}
				// 			if(d.ivt!=0)
				// 				d.ito=d.cor/d.ivt;
				// 		}else{
				// 			let avgta=(d.ta+data[i+1].ta)/2;
				// 			if(avgta!=0){
				// 				d.ato=d.gr/avgta;
				// 			}
				// 			let avgivt=(d.ivt+data[i+1].ivt)/2;
				// 			if(avgivt!=0)
				// 				d.ito=d.cor/avgivt;
				// 		}
				// 		if(d.ato>99999)d.ato=99999;
				// 		if(d.ato<-99999)d.ato=-99999;
				// 		d.cor=-d.cor;
				// 	}

				// 	for(let d of data){
				// 		await this.insertData(code,d);
				// 	}

				// 	let status=1;	//fetched
				// 	let sql='UPDATE summary SET status='+status+' WHERE id=\''+code+'\'';
				// 	db.query(this.stocks,sql);
				// }
			}else{
				if(code && code.length>0){
					let status=2;	//delisted
					let sql='UPDATE summary SET status='+status+' WHERE id=\''+code+'\'';
					db.query(this.stocks,sql);
					Logger.log('Delisted: '+code);
				}else
					Logger.log('Error: '+Data.error);
			}
		}
		return Data;
	}

	async insertData(code,data){
		let sql='INSERT INTO '+this.code2table(code)+' ( \
			period, \
			sc, \
			ta, \
			tl, \
			ca, \
			ivt, \
			tr, \
			ap, \
			dr, \
			adv, \
			cl, \
			gr, \
			cor, \
			np, \
			npas, \
			npc, \
			gm, \
			pm, \
			ocf, \
			icf, \
			fcf, \
			roe, \
			roa, \
			cr, \
			atr, \
			ocfr, \
			er, \
			ato, \
			ito, \
			rto \
		) VALUES(\''
			+data.period+'\','
			+data.sc+','
			+data.ta+','
			+data.tl+','
			+data.ca+','
			+data.ivt+','
			+data.tr+','
			+data.ap+','
			+data.dr+','
			+data.adv+','
			+data.cl+','
			+data.gr+','
			+data.cor+','
			+data.np+','
			+data.npas+','
			+data.npc+','
			+data.gm+','
			+data.pm+','
			+data.ocf+','
			+data.icf+','
			+data.fcf+','
			+data.roe+','
			+data.roa+','
			+data.cr+','
			+data.atr+','
			+data.ocfr+','
			+data.er+','
			+data.ato+','
			+data.ito+','
			+data.rto+')'
		;
		await db.query(this.code2db(code),sql);
	}
	
	async createTable(code){
		let sql='CREATE TABLE '+this.code2table(code)+' ( \
		    period character varying(6) primary key, \
		    sc integer, \
		    ta decimal(10,2), \
		    tl decimal(10,2), \
		    ca decimal(10,2), \
		    ivt decimal(10,2), \
		    tr decimal(10,2), \
		    ap decimal(10,2), \
		    dr decimal(10,2), \
		    adv decimal(10,2), \
		    cl decimal(10,2), \
		    gr decimal(12,2), \
		    cor decimal(10,2), \
		    np decimal(10,2), \
		    npas decimal(10,2), \
		    npc decimal(10,2), \
		    gm decimal(7,2), \
		    pm decimal(7,2), \
		    ocf decimal(10,2), \
		    icf decimal(10,2), \
		    fcf decimal(10,2), \
		    roe decimal(7,2), \
		    roa decimal(7,2), \
		    cr decimal(7,2), \
		    atr decimal(7,2), \
		    ocfr decimal(7,2), \
		    er decimal(8,2), \
		    ato decimal(7,2), \
		    ito decimal(7,2), \
		    rto decimal(7,2) \
		)';
		let res=await db.query(this.code2db(code),sql);
		if(res)
			Logger.log('table '+this.code2table(code)+' created');
		return res;
	}

	code2db(code){
		return 'f10_us';
	}

	code2table(code){
		return 'f10_'+code;
	}

	sleep(ms){
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

exports = module.exports = class FetchFinancialTrigger{
	constructor(pageFetcher){
		this.page='echo/financial/us';
		this.url='http://127.0.0.1/'+this.page;
		db.destroy();

		this.fetcher=new Fetcher(pageFetcher);
		pageFetcher.fetchers.push(this.fetcher);
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	async process(data){
		Logger.log('fetch_financial_us process');
		// This filters with status, so just use it normally when new stock published		
		let sql='SELECT id FROM summary WHERE (status IS NULL OR status<1) ORDER BY id';
		let res=await db.query(this.fetcher.stocks,sql);

		let stocks=[];
		let ids=[];
		const parallel=4;
		const bundle=1+res.rows.length/parallel;
		for(let i=0,ii=res.rows.length;i<ii;++i){
			ids.push(res.rows[i].id);

			stocks.push(ids);
			break;

			if(ids.length>=bundle || i==ii-1){
				stocks.push(ids);
				ids=[];
			}
		}		

		let count=0;
		for(let ids of stocks){
			//async process list
			this.processList(ids);
			count+=ids.length;
		}

		return 'Start process financials, total='+count;
	}

	async processList(ids){
		for(let code of ids){
			const url=this.fetcher.url.replace(/_code_/g,code)
			await PageFetcher.fetch(url);
		}
	}
}
