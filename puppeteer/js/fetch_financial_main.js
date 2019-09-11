const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');
const F10Utils=require('./fetch_financial');

exports = module.exports = class FetchFinancial{

	constructor(){
		//http://quotes.money.163.com/f10/zycwzb_000876.html
		this.page='quotes.money.163.com/f10/zycwzb';
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

		function fill(field,idx){
			let hta=hRows[idx];
			let hData=hta.querySelectorAll('td');
			if(hData.length!=data.length)
				return;
			for(let i=0;i<hData.length;++i){
				let value=hData[i].textContent.replace(/\,/g,'');
				if(value=='--')
					continue;
				// 10k => 1m
				if(idx!=19 && idx!=1)
					value=value/100;
				// 1m => 100m
				if(idx>=14 && idx<=18)
					value=value/100;
				let d=data[i];
				if(value)
					d[field]=value;
			}		
		}
	
		//f10/zycwzb_000876.html
		let pathname=window.location.pathname;
		let code=pathname.substr(pathname.indexOf('_')+1,6);
		var data=[];

		let tbodySelector='#scrollTable > div.col_r > table > tbody';
		let hTable=bodyHandle.querySelector(tbodySelector);
		if(!hTable)
			return {'code':code, 'error':'.tbody not found when fetch zycwzb'};
		let hRows=hTable.querySelectorAll('tr');
		if(!hRows)
			return {'code':code, 'error':'<tr> not found when fetch rows'};
		if(hRows.length<=0)
			return {'code':code, 'error':'data not found when fetch head'};

		// parse head
		let hHead=hRows[0];
		let hPeriods=hHead.querySelectorAll('th');
		if(!hPeriods)
			return {'code':code, 'error':'<th> not found when fetch period'};
		for(let hPeriod of hPeriods){
			let str=hPeriod.textContent;
			let year=str.substr(0,4);
			let quater=str.substr(5,2)/3;
			let period=year+'Q'+quater;
			if(period.length!=6)
				continue;
			let d=initData(period);

			// temp used
			d.eps=0;
			d.eas=0;	//Equity Attributable to ShareHolders
			d.gp=0;	//Gross profit

			data.push(d);
		}

		// fill('sc',);
		fill('ta',14);
		fill('tl',16);
		fill('ca',15);
		// fill('ivt',);
		// fill('tr',);
		// fill('dr',);
		// fill('adv',);
		fill('cl',17);
		fill('gr',4);
		// fill('cor',);
		// fill('np',);
		fill('npas',10);
		fill('npc',11);
		// fill('gm',);
		// fill('pm',);
		fill('ocf',12);
		// fill('icf',);
		// fill('fcf',);
		fill('roe',19);
		// fill('roa',);
		// fill('cr',);
		// fill('atr',);
		// fill('ocfr',);
		// fill('er',);
		// fill('ato',);
		// fill('ito',);
		// fill('rto',);

		fill('eps',1);
		fill('eas',18);
		fill('gp',9);

		return {'code':code, 'data':data};
	}

	async process(Data){
		if(Data){
			let code=Data.code;
			let data=Data.data;
			if(code && data){
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
							d.roa=d.gp/d.ta;
							d.ato=d.gr/d.ta;
						}
					}else{
						let avgta=(d.ta+data[i+1].ta)/2;
						if(avgta!=0){
							d.roa=d.gp/avgta;
							d.ato=d.gr/avgta;
						}
					}
					if(d.ato>99999)d.ato=99999;
					if(d.ato<-99999)d.ato=-99999;
				}

				let res=await this.createTable(code);
				if(res){
					for(let d of data){
						await this.insertData(code,d);
					}
				}
			}
			// fetch from zcfzb
			const url='http://quotes.money.163.com/f10/zcfzb_'+code+'.html';
	        await PageFetcher.fetch(url);
		}
		return Data;
	}

	async insertData(code,data){
		let sql='INSERT INTO '+F10Utils.Code2.table(code)+' ( \
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
		await db.query(F10Utils.Code2.db(code),sql);
	}
	
	async createTable(code){
		let sql='CREATE TABLE '+F10Utils.Code2.table(code)+' ( \
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
		let res=await db.query(F10Utils.Code2.db(code),sql);
		if(res)
			Logger.log('table '+F10Utils.Code2.table(code)+' created');
		return res;

		/*
		总股本	Share Capital	SC
		decimal(8,2)[单位: 最大值] => [亿: 99万亿], [百万: 9999千亿]
		(亿)
		总资产	Total Assets	TA
		总负债	Total Liabilities	TL
		//归属净资产	Equity Attributable to ShareHolders	EAS
		流动资产	Current Assets	CA
		流动负债	Current Liabilities	CL
		(百万)
		存货	Inventory	IVT
		应收账	Trade Recveivables	TR
		应付款	Account Payable	AP
		预收款	Deposit Recived	DR
		预付款	Advance	ADV
		营收	Gross Revenue	GR
		营业成本	Cost of Revenues	COR
		净利	Net Profit	NP
		归属净利	Net Profit Attributable to ShareHolders	NPAS
		扣非净利	Net Profit Cut 	NPC
		经营现金流	Operating Cash Flow	OCF
		投资现金流	Investment Cash Flow	ICF
		筹资现金流	Financial Cash Flow	FCF
		(%)
		//毛利率	Gross Margin	GM
		净利率	Profit Margin	PM
		净资产收益率	Return on Equity	ROE
		总资产收益率	Return on Assets	ROA
		流动比率	CurrentRatio	CR
		速动比率	Acid-test-Ratio	ATR
		现金流量比率	Operating Cash Flow Ratio	OCFR
		产权比率	Equity Ratio	ER
		总资产周转率	Total Asset Turnover	ATO
		存货周转率	Inventory TurnOver	ITO
		//应收账周转率	Receivable TurnOver	RTO
		*/
	}
}
