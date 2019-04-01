/**
 * 
 */
function requestStock(){
	
	var params=new FormData();
	params.append("name","Eric");
	
	let url=_G.api_url+"stock/list";
	net.request(url,function(resp){
		if(resp!=null){
			listStock(resp);
		}
	},params,false);
}

function listStock(stock){
	let stockView=utils.getElementById("stock-list");
	var childs = stockView.childNodes; 
	for(var i = childs.length - 1; i >= 0; i--) { 
		stockView.removeChild(childs[i]); 
	}
	
	for(i in stock){
		let product=stock[i];
		console.log("product: "
			+"id="+product.id
			+",price="+product.price
			+",name="+product.name
			+",icon="+product.icon);
			
		let elem = document.createElement('div');
		elem.setAttribute('class','index-pro1-list');
		elem.innerHTML='\
			<dl>\
				<dt><a href="proinfo.html?product='+product.id+'"><img src="images/'+product.icon+'" /></a></dt>\
				<dd class="ip-text"><a href="proinfo.html">'+product.name+'</a><span>已售：'+product.sales+'</span></dd>\
				<dd class="ip-price"><strong>¥'+product.discount+'</strong> <span>¥'+product.price+'</span></dd>\
			</dl>\
		';
		stockView.appendChild(elem); 
	}
}

requestStock();
