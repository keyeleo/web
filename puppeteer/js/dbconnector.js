	
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
				// var conString = "postgres://vic:liu@172.16.50.41:39008/"+db;
				var conString = "postgres://vic:liu@192.168.31.226:39008/"+db;
				// var conString = "postgres://vic:liu@code.biad.com.cn:39008/"+db;
				var client = new pg.Client(conString);
				client.on('end',()=>{
					this.dbs[db]=null;
			    	Logger.log('PostgreSQL end: '+conString);
				});
				client.on('error',err=>{
					this.dbs[db]=null;
			    	Logger.log('PostgreSQL error: '+conString+': '+err);
				});
				await client.connect().catch(e=>{
					client=null;
		    		Logger.log('PostgreSQL connected error: '+e+', host='+conString);
				});

				if(client){
			    	this.dbs[db]=client;
					this.connecting[db]=false;
			    	Logger.log('PostgreSQL connected: '+conString);
				}
			}
		}
		return this.dbs[db];
	}

	_destroy(db){
		if(this.dbs[db])this.dbs[db].end();
	}

	static async query(db, sql){
		if(!this.instance)
			this.instance=new Postgres();
		let con=await this.instance.connect(db);
		if(con){
			// will return 'undefined' if query failed
			return await con.query(sql).catch(function(e){
			    Logger.log('PostgreSQL query exception: '+e+', sql:'+sql);
			});
		}else
			return 'PostgreSQL disconnected';
	}

	static destroy(){
		if(this.instance){
			for(let db in this.instance.dbs)
				this.instance._destroy(db);
		}
	}
}
