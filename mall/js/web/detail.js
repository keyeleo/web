/**
 * 
 */

function requestDetail(){
	let obj=utils.parseUrlSearch();
	product=obj.product;
	
	var params=new FormData();
	params.append("uid",_G.uid);

	let url=_G.api_url+"stock/detail?product="+product;
	net.request(url,function(resp){
		if(resp!=null){
			loadDetail(resp);
		}
	},params,false);
}

function loadDetail(obj){
	console.log("detail:");
	for(var i in obj) {
		console.log(i,":",obj[i]);
	}
}

requestDetail();
