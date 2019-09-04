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
				// 10k => 1m
				if(idx!=19 && idx!=1)
					value=value/100;
				// 1m => 100m
				if(idx>=14 && idx<=17)
					value=value/100;
				let d=data[i];
				d[field]=value;
			}		
		}
	
		var data=[];

		let tbodySelector='#scrollTable > div.col_r > table > tbody';
		let hTable=bodyHandle.querySelector(tbodySelector);
		if(!hTable)
			return '.tbody not found when fetch reports';
		let hRows=hTable.querySelectorAll('tr');
		if(!hRows)
			return '<tr> not found when fetch rows';
		if(hRows.length<=0)
			return 'data not found when fetch head';

		// parse head
		let hHead=hRows[0];
		let hPeriods=hHead.querySelectorAll('th');
		if(!hPeriods)
			return '<th> not found when fetch period';
		for(let hPeriod of hPeriods){
			let str=hPeriod.textContent;
			let year=str.substr(0,4);
			let quater=str.substr(5,2)/3;
			let period=year+'Q'+quater;
			let d=initData(period);

			// temp used
			data.eps=0;

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

		for(let i=0;i<data.length;++i){
			let d=data[i];
			d.sc=d.npas/d.eps;
			d.cr=d.ca/d.cl;
			d.er=d.tl/(d.ta-d.tl);
			d.pm=d.np/d.gr;
			d.ocfr=d.ocf/d.cl;
			if(i==data.length-1)
				d.ato=d.gr/d.ta;
			else
				d.ato=d.gr/(d.ta+data[i+1].ta)/2;
		}

		//f10/zycwzb_000876.html
		let pathname=window.location.pathname;
		let code=pathname.substr(pathname.indexOf('_')+1,6);
		return {'code':code, 'data':data};
	}

	process(data){
		if(data){
			let code=data.code;
			this.createTable(code);
			for(let d of data.data){
				this.insertData(code,d);
			}

			// fetch from zcfzb
			const url='http://quotes.money.163.com/f10/zcfzb_'+code+'.html';
	        PageFetcher.fetch(url);
		}
		return data;
	}

	insertData(code,data){
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
		db.query(F10Utils.Code2.db(code),sql);
	}
	
	createTable(code){
		let sql='CREATE TABLE '+F10Utils.Code2.table(code)+' ( \
		    period character varying(6) primary key, \
		    sc integer, \
		    ta decimal(8,2), \
		    tl decimal(8,2), \
		    ca decimal(8,2), \
		    ivt decimal(8,2), \
		    tr decimal(8,2), \
		    ap decimal(8,2), \
		    dr decimal(8,2), \
		    adv decimal(8,2), \
		    cl decimal(8,2), \
		    gr decimal(9,2), \
		    cor decimal(8,2), \
		    np decimal(8,2), \
		    npas decimal(8,2), \
		    npc decimal(8,2), \
		    gm decimal(5,2), \
		    pm decimal(5,2), \
		    ocf decimal(8,2), \
		    icf decimal(8,2), \
		    fcf decimal(8,2), \
		    roe decimal(5,2), \
		    roa decimal(5,2), \
		    cr decimal(5,2), \
		    atr decimal(5,2), \
		    ocfr decimal(5,2), \
		    er decimal(5,2), \
		    ato decimal(5,2), \
		    ito decimal(5,2), \
		    rto decimal(5,2) \
		)';
		db.query(F10Utils.Code2.db(code),sql);
		Logger.log('table '+F10Utils.Code2.table(code)+' created');

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
