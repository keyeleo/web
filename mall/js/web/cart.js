/**
 * 
 */

function loadCart(){
	
	console.log("cart.js ,api_url="+_G.api_url+",uid="+_G.uid);

	var params=new FormData();
	params.append("uid",_G.uid);

	let url=_G.api_url+"cart/load";
	net.request(url,function(obj){    
		var bookTb = utils.getElementById("cartsTable");
		if(bookTb!=null){
			// 删除bookTb原有的所有行
			while(bookTb.rows.length > 0){
				bookTb.deleteRow(bookTb.rows.length - 1);
			}
			
			for (var i = 0 , len = obj.length ; i < len ; i++){
				var product=obj[i];
				var tr = bookTb.insertRow(i);

				var cell = tr.insertCell(0);
				cell.setAttribute('width','4%');
				cell.innerHTML='<input type="checkbox" name="1" />';

				cell = tr.insertCell(1);
				cell.setAttribute('class','dingimg');
				cell.setAttribute('width','25%');
				cell.innerHTML='<img src="images/pro1.jpg" />';

				cell = tr.insertCell(2);
				cell.setAttribute('width','50%');
				elem = document.createElement('h3');
				elem.innerHTML = '三级分销农庄有机瓢瓜400g';
				cell.appendChild(elem); 
				elem = document.createElement('time');
				elem.innerHTML = '下单时间：'+new Date(product.time);
				cell.appendChild(elem); 

				cell = tr.insertCell(3);
				cell.setAttribute('width','15%');
				cell.setAttribute('align','right');
				cell.innerHTML='<input type="text" class="spinnerExample" />';

				cell = tr.insertCell(4);
				cell.setAttribute('colspan',4);
				cell.innerHTML='<strong class="orange">¥36.60</strong>';
			}
			$('.spinnerExample').spinner({});
		}

	},params,false);
}

loadCart();
