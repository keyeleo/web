/**
 * 
 */
class net{
	
	constructor(){
		
	}
	
	static request(url,callback,params,get=true){
	    var httpRequest=new XMLHttpRequest();
	    httpRequest.open(get?"GET":"POST",url,true);
	    httpRequest.onreadystatechange=function(){
	        if(httpRequest.readyState===httpRequest.DONE && httpRequest.status===200 && callback){
	            var type=httpRequest.getResponseHeader("Content-type");
	            console.log("type="+type);
	            
	            if(type.match(/^text/)){
	                //将响应主体传送给回调函数，注：HEAD无响应主体
	                callback(httpRequest.responseText/*响应主体为文本*/);
	                //callback(httpRequest.responseXML/*响应主体为XML*/);
	            }else if(type.match(/json/)){
		            console.log("type=json,responseText="+httpRequest.responseText+",responseXML="+httpRequest.responseXML);
	                callback(JSON.parse(httpRequest.responseText));
	            }
	        }
	    }

	    httpRequest.send(params);
	}
}

class ColoredPoint extends net{
    constructor(x, y, color){
        super();
    }
}
