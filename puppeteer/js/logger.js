	
exports = module.exports = class Logger{
	constructor(){
	}

	static log(msg){
		if(!this.logger){
			const log4js = require("log4js");
			log4js.configure({
			    appenders: {
			        log_file: {
			            type: "dateFile",
			            filename: "/data/logs/goldspider",
			            pattern: "yyyy-MM-dd.log",
			            alwaysIncludePattern: true,
			        },
			    },
			    categories: { default: { appenders: ["log_file"], level: "debug" } }
			});
			this.logger = log4js.getLogger("vic");
		}
		this.logger.debug(msg)
		console.log(msg);
	}
}
