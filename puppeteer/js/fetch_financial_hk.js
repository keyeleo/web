const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');

class Fetcher{
	constructor(pageFetcher){
		this.page='emweb.securities.eastmoney.com/PC_HKF10/FinancialAnalysis/index';
		this.url='http://'+this.page+'?type=web&code=';
	}

	fetch(bodyHandle){
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

		function fill(field,idx,handles){
			let hta=handles[idx];
			let hData=hta.querySelectorAll('td');
			for(let i=0;i<hData.length;++i){
				if(i>=data.length)
					continue;
				let str=hData[i].textContent;
				let scale=(str.indexOf('亿')>=0?100000000:1);				
				let value=scale * parseInt(str.replace(/亿/g,''));
				value/=1000000;		//=>1m
				if(field=='ta' || field=='tl' || field=='ca' || field=='cl')
					value/=100;		//=>100m

				let d=data[i];
				if(value)
					d[field]=value;
			}		
		}

		let code=null;
		if(window.location.search.length>0){
			var reg = new RegExp("(^|&)code=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if(r) code=decodeURI(r[2]);
		}
		if(!code)
			return {'code':'null', 'error':'invalid code'};

		var data=[];
		//head or title
		let hHeads=bodyHandle.querySelector('#tb_zcfzb_abgqex > tbody > tr:nth-child(1)');
		if(!hHeads)
			return {'code':code, 'error':'<tr> not found when fetch period'};
		let hPeriods=hHeads.querySelectorAll('th');
		if(!hPeriods)
			return {'code':code, 'error':'<th> not found when fetch period'};
		for(let i=0;i<hPeriods.length;++i){
			if(i==0)continue;
			let hPeriod=hPeriods[i];
			let str=hPeriod.textContent;	//19-06-30
			let year='20'+str.substr(0,2);
			let quater=str.substr(3,2)/3;
			let period=year+'Q'+quater;
			if(period.length!=6)
				continue;
			let d=initData(period);

			// temp used
			d.eps=0;
			d.eas=0;	//Equity Attributable to ShareHolders

			data.push(d);
		}

		//tables
		let hMain=bodyHandle.querySelector('#table2_abgq2 > tbody');
		if(!hMain)
			return {'code':code, 'error':'<tbody> not found when fetch main'};
		let hhMain=hMain.querySelectorAll('tr');

		let hBalance=bodyHandle.querySelector('#tb_zcfzb_abgqex > tbody');
		if(!hBalance)
			return {'code':code, 'error':'<tbody> not found when fetch balance'};
		let hhBalance=hBalance.querySelectorAll('tr');

		let hProfit=bodyHandle.querySelector('#table_abgqex > tbody');
		if(!hProfit)
			return {'code':code, 'error':'<tbody> not found when fetch profit'};
		let hhProfit=hProfit.querySelectorAll('tr');

		let hCash=bodyHandle.querySelector('#table1_abgq1ex > tbody');
		if(!hCash)
			return {'code':code, 'error':'<tbody> not found when fetch cash'};
		let hhCash=hCash.querySelectorAll('tr');

	// // fill('sc',);
	// 	fill('ta',23,hhBalance);
	// 	fill('tl',42,hhBalance);
	// 	fill('ca',9,hhBalance);
	// 	fill('ivt',7,hhBalance);
	// 	fill('tr',5,hhBalance);
	// // fill('dr',);
	// 	fill('adv',6,hhBalance);
	// 	fill('cl',32,hhBalance);
	// 	fill('gr',1,hhProfit);
	// 	fill('cor',2,hhProfit);
	// 	fill('np',13,hhProfit);
	// 	fill('npas',14,hhProfit);
	// 	fill('npc',11,hhMain);
	// 	fill('gm',22,hhMain);
	// 	fill('pm',23,hhMain);
	// 	fill('ocf',17,hhCash);
	// 	fill('icf',29,hhCash);
	// 	fill('fcf',40,hhCash);
	// 	fill('roe',19,hhMain);
	// 	fill('roa',21,hhMain);
	// 	fill('cr',31,hhMain);
	// // fill('atr',);
	// // fill('ocfr',);
	// // fill('er',);
	// // fill('ato',);
	// // fill('ito',);
	// // fill('rto',);

	// 	fill('eps',2,hhMain);
	// 	fill('eas',49,hhBalance);

		return {'code':code, 'data':data};
	}

	async process(Data){
		if(Data){
			let code=Data.code;
			let data=Data.data;
			if(code && data){
				let res=await this.createTable(code);
				if(res){
					for(let i=0;i<data.length;++i){
						let d=data[i];
						if(d.eps!=0)
							d.sc=d.npas/d.eps;
						if(d.cl!=0)
							d.cr=d.ca/d.cl;
						if(d.eas!=0){
							d.er=d.tl*100/d.eas;
							if(d.er>999999)d.er=999999;
							if(d.er<-999999)d.er=-999999;
						}
						if(d.cl!=0){
							d.ocfr=d.ocf/d.cl;
							if(d.ocfr>99999)d.ocfr=99999;
							if(d.ocfr<-99999)d.ocfr=-99999;
						}
						if(i==data.length-1){
							if(d.ta!=0){
								d.ato=d.gr/d.ta;
							}
							if(d.ivt!=0)
								d.ito=d.cor/d.ivt;
						}else{
							let avgta=(d.ta+data[i+1].ta)/2;
							if(avgta!=0){
								d.ato=d.gr/avgta;
							}
							let avgivt=(d.ivt+data[i+1].ivt)/2;
							if(avgivt!=0)
								d.ito=d.cor/avgivt;
						}
						if(d.ato>99999)d.ato=99999;
						if(d.ato<-99999)d.ato=-99999;
					}

					for(let d of data){
						await this.insertData(code,d);
					}

					let status=1;	//fetched
					let sql='UPDATE summary SET status='+status+' WHERE id=\''+code+'\'';
					db.query('stocks_hk',sql);
				}
			}else
				Logger.log(Data.error);
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
		return 'f10_hk';
	}

	code2table(code){
		return 'f10_'+code;
	}
}

exports = module.exports = class FetchFinancialTrigger{
	constructor(pageFetcher){
		this.page='echo/financial/hk';
		this.url='http://127.0.0.1/'+this.page;
		db.destroy();

		this.fetcher=new Fetcher(pageFetcher);
		pageFetcher.fetchers.push(this.fetcher);
	}

	fetch(bodyHandle){
		return {'result':'Start fetching finanical'};
	}

	async process(data){
		Logger.log('fetch_financial_hk process');
		// This filters with status, so just use it normally when new stock published		
		let sql='SELECT id FROM summary WHERE (status IS NULL OR status<1) ORDER BY id';
		let res=await db.query('stocks_hk',sql);

		let stocks=[];
		let ids=[];
		const parallel=4;
		const bundle=1+res.rows.length/parallel;
		for(let i=0,ii=res.rows.length;i<ii;++i){
			ids.push(res.rows[i].id);
			// if(ids.length>=bundle || i==ii-1){
			// 	stocks.push(ids);
			// 	ids=[];
			// }
			Logger.log('found '+res.rows[i].id);
			stocks.push(ids);
			break;
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
			const url=this.fetcher.url+code;
			await PageFetcher.fetch(url);
		}
	}
}
