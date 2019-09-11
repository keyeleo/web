const Logger=require('./logger');
const db=require('./dbconnector');
const PageFetcher=require('./pagefetcher');
const F10Utils=require('./fetch_financial');

exports = module.exports = class FetchFinancial{

	constructor(){
		//http://quotes.money.163.com/f10/lrb_000876.html
		this.page='quotes.money.163.com/f10/lrb';
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
			return {'code':code, 'error':'.tbody not found when fetch lrb'};
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
			let d=initData(period);
			data.push(d);
		}

		// fill('sc',);
		// fill('ta',14);
		// fill('tl',16);
		// fill('ca',15);
		// fill('ivt',22);
		// fill('tr',9);
		// fill('dr',66);
		// fill('adv',10);
		// fill('cl',17);
		fill('gr',1);
		fill('cor',8);
		fill('np',40);
		// fill('npas',10);
		// fill('npc',11);
		// fill('gm',);
		// fill('pm',);
		// fill('ocf',12);
		// fill('icf',);
		// fill('fcf',);
		// fill('roe',19);
		// fill('roa',);
		// fill('cr',);
		// fill('atr',);
		// fill('ocfr',);
		// fill('er',);
		// fill('ato',);
		// fill('ito',);
		// fill('rto',);

		return {'code':code, 'data':data};
	}

	async process(Data){
		if(Data){
			let code=Data.code;
			let data=Data.data;
			if(code && data){
				for(let i=0;i<data.length;++i){
					let d=data[i];
					if(d.gr!=0){
						d.pm=d.np/d.gr*100;
						if(d.pm>99999)d.pm=99999;
						if(d.pm<-99999)d.pm=-99999;
					}
					if(i==data.length-1){
						if(d.ivt!=0)
							d.ito=d.cor/d.ivt;
					}else{
						let avgivt=(d.ivt+data[i+1].ivt)/2;
						if(avgivt!=0)
							d.ito=d.cor/avgivt;
					}
				}

				for(let d of data){
					this.updateData(code,d);
				}
				//Logger.log('table '+F10Utils.Code2.table(code)+' updated');
			}
			// fetch from xjllb
			const url='http://quotes.money.163.com/f10/xjllb_'+code+'.html';
	        await PageFetcher.fetch(url);
		}
		return Data;
	}
	
	updateData(code,data){
		let sql='UPDATE '+F10Utils.Code2.table(code)+' SET '
			// +'sc='+data.sc+','
			// +'ta='+data.ta+','
			// +'tl='+data.tl+','
			// +'ca='+data.ca+','
			// +'ivt='+data.ivt+','
			// +'tr='+data.tr+','
			// +'ap='+data.ap+','
			// +'dr='+data.dr+','
			// +'adv='+data.adv+','
			// +'cl='+data.cl+','
			// +'gr='+data.gr+','
			+'cor='+data.cor+','
			+'np='+data.np+','
			// +'npas='+data.npas+','
			// +'npc='+data.npc+','
			// +'gm='+data.gm+','
			+'pm='+data.pm+','
			// +'ocf='+data.ocf+','
			// +'icf='+data.icf+','
			// +'fcf='+data.fcf+','
			// +'roe='+data.roe+','
			// +'roa='+data.roa+','
			// +'cr='+data.cr+','
			// +'atr='+data.atr+','
			// +'ocfr='+data.ocfr+','
			// +'er='+data.er+','
			// +'ato='+data.ato+','
			+'ito='+data.ito
			// +'rto='+data.rto
			+' WHERE period=\''+data.period+'\'';
		db.query(F10Utils.Code2.db(code),sql);
	}
}
