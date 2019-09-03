const Logger=require('./logger');
const db=require('./dbconnector');

exports = module.exports = class FetchFinancial{

	constructor(){
		//http://quotes.money.163.com/f10/zycwzb_000876.html
		this.page='quotes.money.163.com/f10/xjllb';
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
			data.dr=0;
			data.adv=0;
			data.cl=0;
			data.gr=0;
			data.cor=0;
			data.np=0;
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
			data.push(d);
		}

		fill('period',);
		fill('sc',);
				fill('ta',14);
				fill('tl',16);
				fill('ca',15);
			fill('ivt',22);
			fill('tr',9);
			fill('dr',66);
			fill('adv',10);
				fill('cl',17);
				fill('gr',4);
		fill('cor',);
				fill('np',11);
		fill('gm',);
		fill('pm',);
				fill('ocf',12);	//26
		fill('icf',42);
		fill('fcf',55);
				fill('roe',19);
		fill('roa',);
		fill('cr',);
		fill('atr',);
		fill('ocfr',);
		fill('er',);
		fill('ato',);
		fill('ito',);
		fill('rto',);

		//f10/zycwzb_000876.html
		let pathname=window.location.pathname;
		let code=pathname.substr(pathname.indexOf('_')+1,6);
		return {'code':code, 'data':data};
	}

	process(data){
		if(data){
			let code=data.code;
			// this.createTable(code);
			for(let d of data.data){
				this.updateData(code,d);
				break;
			}
		}
		return data;
	}

	tableofCode(code){
		return 'f10_'+code;
	}

	dbofCode(code){
		return 'f10_'+(code/1000<600)?'sz':'sh';
	}
	
	updateData(code,data){
		let sql='UPDATE '+this.tableofCode(code)+' SET '
			+'sc='+data.sc+','
			+'ta='+data.sc+','
			+'tl='+data.sc+','
			+'ca='+data.sc+','
			+'ivt='+data.sc+','
			+'tr='+data.sc+','
			+'dr='+data.sc+','
			+'adv='+data.sc+','
			+'cl='+data.sc+','
			+'gr='+data.sc+','
			+'cor='+data.sc+','
			+'np='+data.sc+','
			+'gm='+data.sc+','
			+'pm='+data.sc+','
			+'ocf='+data.sc+','
			+'icf='+data.sc+','
			+'fcf='+data.sc+','
			+'roe='+data.sc+','
			+'roa='+data.sc+','
			+'cr='+data.sc+','
			+'atr='+data.sc+','
			+'ocfr='+data.sc+','
			+'er='+data.sc+','
			+'ato='+data.sc+','
			+'ito='+data.sc+','
			+'rto='+data.sc
			+' WHERE period='+data.period;
		// Logger.log('update sql='+sql);
		db.query(dbofCode(code),sql);
	}
}
