const Logger=require('./logger');

exports = module.exports = class TestClass{

	constructor(){
		this.page='echo/test';
	}

	fetch(bodyHandle){
		return {};
	}

	async process(data){
		const args= "args=" + process.argv.slice(2);
		Logger.log(args);
		return args;
	}
}