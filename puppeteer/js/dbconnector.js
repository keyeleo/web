	
const pg=require('pg')
const Logger=require('./logger');

exports = module.exports = class Postgres{
	constructor(){
	}

	sleep(ms){
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async connect(){
		if(!this.client){
			while(this.connecting)
				await this.sleep(10);
			if(this.client)
				return;

			this.connecting=true;
			var conString = "postgres://vic:liu@code.biad.com.cn:39008/stocks";
			var client = new pg.Client(conString);
			client.on('end',()=>{
				this.client=null;
		    	Logger.log('PostgreSQL end');
			});
			client.on('error',err=>{
				this.client=null;
		    	Logger.log('PostgreSQL error: '+err);
			});
			// await client.connect();
			await client.connect(function(err) {
			    if(err)
			    	Logger.error('PostgreSQL connect failed: ', err);
			    else{
			    	client=null;
			    }
			});
	    	this.client=client;
			this.connecting=false;
	    	Logger.log('PostgreSQL connected');
		}
	}

	async doQuery(sql, func){
		await this.connect();

		await this.client.query(sql, function(err, data) {
			if(err) {
				Logger.log('Query failed, sql='+err);
			}else{
				if(func)
					func(data);
				Logger.log('Query sql='+sql+', result='+JSON.stringify(data.rows)); 
			}
		});
	}

	destroy(){
		if(this.client)this.client.end();
	}

	static query(sql, func){
		if(!this.instance)
			this.instance=new Postgres();
		this.instance.doQuery(sql, func);
	}
}
