/**
 * 
 */
var params=new FormData();
params.append("name","Eric");

net.request("http://localhost:8080/test",function(resp){
	let msg=(resp==null?"<h1>Hello Server!</h1>":resp);
	document.write(msg);
	console.log(msg);
},params,false);
