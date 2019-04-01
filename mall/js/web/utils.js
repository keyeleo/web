/**
 * 
 */
class utils{
	
	constructor(){
		
	}
	
	static parseUrlSearch(){
		var obj = {};
		var arr = window.location.search.slice(1).split("&");
		for (var i = 0, len = arr.length; i < len; i++) {
			var nv = arr[i].split("=");
			obj[unescape(nv[0]).toLowerCase()] = unescape(nv[1]);
		}
		return obj;
	}
	
	static getElementById(id){
		return document.getElementById(id);
	}
}
