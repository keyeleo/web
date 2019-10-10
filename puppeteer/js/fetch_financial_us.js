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
		let code=Data.code;
		Data=Data.data;

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
			'ta': '资产合计',
			'tl': '负债合计',
			'ca': '流动资产合计',
			'cl': '流动负债合计',
			'ivt': '存货',
			'tr': '应收账款',
			// 'dr': '',
			'adv': '预付款项',
			'gr': '营业收入',
			'cor': '营业成本',
			'np': '净利润',
			'npas': '归属于母公司股东的净利润',
			// 'npc': '',
			// 'gm': '',
			// 'pm': '',
			'ocf': '经营活动现金流量净额',
			'icf': '投资活动现金流量净额',
			'fcf': '筹资活动现金流量净额',
			// 'roe': '',
			// 'roa': '',
			'cr': '流动比率',
			'atr': '速动比率',
			// 'ocfr': '',
			'er': '产权比率',
			'ato': '总资产周转率',
			'ito': '存货周转率',
			'rto': '应收账款周转率',
			'eps': '基本每股收益',
			'eas': '归属于母公司股东权益合计',
			'gp': '营业毛利润',
		};

		function fill(rowsMap,field,name){
			// let hta=handles[idx];
			let hta=rowsMap[name];
			if(!hta){
				if(field=='gr')
					hta=rowsMap['总收入'];
				else if(field=='ca')
					hta=rowsMap['现金和中央银行存款'];
				else if(field=='tr')
					hta=rowsMap['应收款项'];
				else if(field=='ocf')
					hta=rowsMap['经营活动产生的现金流量净额'];
				else if(field=='icf')
					hta=rowsMap['投资活动产生的现金流量净额'];
				else if(field=='fcf')
					hta=rowsMap['筹资活动产生的现金流量净额'];
				else if(field=='gp')
					hta=rowsMap['持续经营业务的税前利润'];
			}
			if(!hta){
				if(field=='gp')
					hta=rowsMap['税前利润'];
			}
			if(!hta){
				for(let key in rowsMap){
					if(name.indexOf(key)>=0){
						hta=rowsMap[key];
						break;
					}
				}
				if(!hta){
					if(field=='adv' || field=='ivt' || field=='cor' || field=='tr' || field=='atr' || field=='cr' || field=='er' ||
							field=='icf' || field=='fcf' || field=='ato' || field=='ito' || field=='rto' ||
							field=='gr')
						return true;
					if(field=='ca' || field=='cl' || field=='tr'){
						for(let key in rowsMap){
							//bank or ensurance
							if(key=='存放同业银行款项' || key=='预收保费'){
								return true;
							}
						}
					}
					return false;
				}
			}

			for(let i=0;i<hta.length;++i){
				if(i>=data.length)
					break;
				let svalue=hta[i];
				let value=parseFloat(svalue);
				if(field!='roe' && field!='roa' && field!='pm' && field!='gm' &&
						field!='ato' && field!='ito' && field!='rto' && field!='er' && field!='atr' && field!='cr')
					value/=100;		//=>1m
				if(field=='ta' || field=='tl' || field=='ca' || field=='cl')
					value/=100;		//=>100m

				let d=data[i];
				if(value)
					d[field]=value;
			}	
			return true;	
		}

		let keyindex=JSON.parse(Data.keyindex);
		let benefit=JSON.parse(Data.benefit);
		let debt=JSON.parse(Data.debt);
		let cash=JSON.parse(Data.cash);
		if(!keyindex || !benefit || !debt || !cash){
			return {'code':code, 'error': code+': json parse'};
		}

		let report={};	//{'总资产': [21,20,18,...], '总负债': [14,13,10]}
		var data=[];

		//parse title
		let period=[];
		let titles=keyindex.report[0];
		for(let str of titles){
			//2019-06-30
			let year=str.substring(0,4);
			let quater=str.substring(5,7)/3;
			let period=year+'Q'+quater;
			if(period.length!=6)
				continue;
			let d=initData(period);

			// temp used
			d.eps=0;
			d.eas=0;	//Equity Attributable to ShareHolders
			d.gp=0;

			data.push(d);
		}

		//parse content
		for(let tb of [keyindex, benefit, debt, cash]){
			for(let i=1;i<tb.title.length;++i){
				let title=tb.title[i][0];
				let unit=tb.title[i][1];	//default k
				let data=tb.report[i];
				if(unit.substring(0,2)=='百万'){
					// for(let j=0;j<data.length;++j){
					// 	data[j]*=100;
					// }
				}
				title=title.replace(/\s+/g,"");	//remove blanks

				report[title]=data;
			}
		}

		//fill data
		for(let ik in indicators){
			let indicator=indicators[ik];
			if(!fill(report, ik, indicator))
				return {'code':code, 'error': code+': '+indicator+' error'};
		}

		return data;
	}

	delist(code){
		let status=2;	//delisted
		let sql='UPDATE summary SET status='+status+' WHERE id=\''+code+'\'';
		db.query(this.stocks,sql);
		Logger.log('Delisted: '+code);
	}

	async process(Data,url){
		if(Data){
			if(Data.error){
				//'http://'+this.page+'_code_/finance/';
				let code=url.substring(url.indexOf(this.page)+this.page.length,url.indexOf('/finance'));
				this.delist(code);
				return 'Error';
			}

			let code=Data.code;
			let data=this.parse(Data);
			if(code && data && !data.error){
				let res=await this.createTable(code);
				if(res){
					for(let i=0;i<data.length;++i){
						let d=data[i];
						if(d.eps!=0)
							d.sc=Math.ceil(d.npas/d.eps);
						if(d.cl!=0){
							d.ocfr=d.ocf/d.cl;
							if(d.ocfr>99999)d.ocfr=99999;
							if(d.ocfr<-99999)d.ocfr=-99999;
						}
						if(d.gr!=0){
							d.pm=d.np/d.gr*100;
							if(d.pm>99999)d.pm=99999;
							if(d.pm<-99999)d.pm=-99999;
						}
						if(i==data.length-1){
							if(d.ta!=0){
								d.roa=d.gp/d.ta;
							}
							if(d.ta!=d.tl){
								d.roe=d.np/(d.ta-d.tl);
							}
						}else{
							let avgta=(d.ta+data[i+1].ta)/2;
							if(avgta!=0){
								d.roa=d.gp/avgta;
							}
							let avge=(d.ta+data[i+1].ta-d.tl-data[i+1].tl)/2;
							if(avge!=0){
								d.roe=d.np/avge;
							}
						}
					}

					for(let d of data){
						await this.insertData(code,d);
					}

					let status=1;	//fetched
					let sql='UPDATE summary SET status='+status+' WHERE id=\''+code+'\'';
					db.query(this.stocks,sql);
				}
			}else{
				if(data.error){
					if(data.error.indexOf('资产合计')>=0){
						this.delist(code);
					}else
						Logger.log('Error: '+data.error);
				}
			}
		}
		return 'OK';
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
		//us stocks might have .
		let tb='f10_'+code;
		tb=tb.replace(/\./g,'_');
		return tb;
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
