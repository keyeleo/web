	
const pg=require('pg')
const Logger=require('./logger');

exports = module.exports = class Postgres{
	constructor(){
		this.dbs={};
		this.connecting={};
	}

	sleep(ms){
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async connect(db){
		if(!this.dbs[db]){
			while(this.connecting[db])
				await this.sleep(10);
			if(!this.dbs[db]){
				this.connecting[db]=true;
				var conString = "postgres://vic:liu@code.biad.com.cn:39008/"+db;
				var client = new pg.Client(conString);
				client.on('end',()=>{
					this.dbs[db]=null;
			    	Logger.log('PostgreSQL end');
				});
				client.on('error',err=>{
					this.dbs[db]=null;
			    	Logger.log('PostgreSQL error: '+err);
				});
				await client.connect(function(err) {
				    if(err)
				    	Logger.error('PostgreSQL connect failed: ', err);
				    else{
				    	client=null;
				    }
				});
		    	this.dbs[db]=client;
				this.connecting[db]=false;
		    	Logger.log('PostgreSQL connected');
			}
		}
		return this.dbs[db];
	}

	async doQuery(db, sql, func){
		let con=await this.connect(db);

		await con.query(sql, function(err, data) {
			if(err) {
				Logger.log('Query failed, sql='+err);
			}else{
				if(func)
					func(data);
				// Logger.log('Query sql='+sql+', result='+JSON.stringify(data.rows)); 
			}
		});
	}

	destroy(db){
		if(this.dbs[db])this.dbs[db].end();
	}

	static query(db, sql, func){
		if(!this.instance)
			this.instance=new Postgres();
		this.instance.doQuery(db, sql, func);
	}
}
