/**
 * 
 */
class net{
	
	constructor(){
		
	}
	
	request(url,callback,params,get=true){
	    var http=new XMLHttpRequest();
	    http.open(get?"GET":"POST",url,true);
	    http.onreadystatechange=function(){
	        if(http.readyState===http.DONE && http.status===200 && callback){
	            var type=http.getResponseHeader("Content-type");
	            if(type.match(/^text/)){
	                //将响应主体传送给回调函数，注：HEAD无响应主体
	                callback(http.responseText/*响应主体为文本*/);
	                //callback(request.responseXML/*响应主体为XML*/);
	            }
	        }
	    }

	    http.send(params);
	}
}
