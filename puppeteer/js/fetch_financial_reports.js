const Logger=require('./logger');
const db=require('./dbconnector');

exports = module.exports = class FetchFinancialReports{

	constructor(){
		this.page='data.eastmoney.com/bbsj/yjbb';
	}

	fetch(bodyHandle){
		let data=[];
		let hContent=bodyHandle.querySelector('.content');
		if(!hContent)
			return '.content not found when fetch reports';
		let hPageNav=hContent.querySelector('#PageNav');
		if(!hPageNav)
			return '#PageNav not found when fetch reports';
		let hTable=hContent.querySelector('table');
		if(!hTable)
			return '<table> not found when fetch reports';
		let hTHead=hTable.querySelector('thead');
		if(!hTHead)
			return '<thead> not found when fetch reports';
		let hBody=hTable.querySelector('tbody');
		if(!hBody)
			return '<tbody> not found when fetch reports';
		let hRows=hTable.querySelectorAll('tr');
		if(!hRows)
			return '<tr> not found when fetch reports';

		//all rows
		for(let hRow of hRows){
			let report={};
			//all columns
			let hCols=hRow.querySelectorAll('td');
			if(!hCols || hCols.length<13)
				continue;

			//period
			let hPeriod=hCols[0].querySelector('span');
			if(!hPeriod)
				return '<span> not found when fetch reports: 公告期';
			report.period=hPeriod.textContent;

			//Growth
			let hGrowth=hCols[4].querySelector('span');
			if(!hGrowth)
				return '<span> not found when fetch reports: 营收增长率';
			report.growth=hGrowth.textContent;

			//ROE
			let hROE=hCols[10].querySelector('span');
			if(!hROE)
				return '<span> not found when fetch reports: ROE';
			report.roe=hROE.textContent;

			data.push(report);
		}

		return data;
	}

	process(data){
		if(data){
			let sql='SHOW TABLES';
			db.query('reports', sql);

		}
		return data;
	}
}
