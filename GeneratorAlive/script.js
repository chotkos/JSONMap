$(document).ready(function(){
	 
	var tiles = {};
	var tileTypes = [
		{
			name:"island",
			top:false,
			bottom:false,
			left: false,
			right: false
		},		
		{
			name:"full",
			top:true,
			bottom:true,
			left: true,
			right: true
		},
		{
			name:"bridge0",
			top:false,
			bottom:false,
			left: true,
			right: true
		},
		{
			name:"bridge1",
			top:true,
			bottom:true,
			left: false,
			right: false
		},
		{
			name:"corner0",
			top:false,
			bottom:true,
			left: true,
			right: false
		},
		{
			name:"corner1",
			top:true,
			bottom:false,
			left: true,
			right: false
		},
		{
			name:"corner2",
			top:true,
			bottom:false,
			left: false,
			right: true
		},
		{
			name:"corner3",
			top:false,
			bottom:true,
			left: false,
			right: true
		},
		
		{
			name:"single0",
			top:false,
			bottom:false,
			left: true,
			right: false
		},
		{
			name:"single1",
			top:false,
			bottom:true,
			left: false,
			right: false
		},
		{
			name:"single2",
			top:false,
			bottom:false,
			left: false,
			right: true
		},
		{
			name:"single3",
			top:true,
			bottom:false,
			left: false,
			right: false
		},
		
		{
			name:"surrounded0",
			top:true,
			bottom:true,
			left: true,
			right: false
		},
		{
			name:"surrounded1",
			top:true,
			bottom:false,
			left: true,
			right: true
		},
		{
			name:"surrounded2",
			top:true,
			bottom:true,
			left: false,
			right: true
		},
		{
			name:"surrounded3",
			top:false,
			bottom:true,
			left: true,
			right: true
		},
	];
	
	
	var getTileNeeds = function(i,l){
		var needs = {
			top:null,
			right:null,
			bottom:null,
			left:null
		};
		
		//right
		if(tiles["cell_"+i+"_"+(l+1)]){
			needs.right =tiles["cell_"+i+"_"+(l+1)].left;
		}else{
			needs.right = undefined;
		}
				
		//left
		if(tiles["cell_"+i+"_"+(l-1)]){
			needs.left = tiles["cell_"+i+"_"+(l-1)].right;
		}else{
			needs.left = undefined;
		}
		
		//top
		if(tiles["cell_"+(i-1)+"_"+l]){
			needs.top = tiles["cell_"+(i-1)+"_"+l].bottom;
		}else{
			needs.top = undefined;
		}
		
		//bottom
		if(tiles["cell_"+(i+1)+"_"+l]){
			needs.bottom = tiles["cell_"+(i+1)+"_"+l].top;
		}else{
			needs.bottom = undefined;
		}
		
		return needs;
	};
	 	
	var getTileType = function(i,l){
		var needs = getTileNeeds(i,l);
		
		var acceptable = tileTypes.filter(function(t){ 
		 
			if(needs.top !=undefined && t.top != needs.top) return false;
			if(needs.bottom !=undefined && t.bottom != needs.bottom) return false;
			if(needs.left !=undefined && t.left != needs.left) return false;
			if(needs.right !=undefined && t.right != needs.right) return false;
			
			return true;
		});
		
		if(acceptable.length == 0){
			throw "Sorry, no tile for you";
		}else return acceptable[Math.floor(Math.random()*acceptable.length)]
		
	};
	
	
	var generateTable = function(width,height){
		
		for(var i=0;i<height;i++){
			$(".mapTable").append("<tr class='mapRow'></tr>");
			for(var l=0;l<width;l++){
				$($(".mapRow")[i]).append("<td class='mapCell' id='cell_"+i+"_"+l+"'></td>");
				$("#cell_"+i+"_"+l).click(function(e){
					console.log(e);
					var split = e.currentTarget.id.split('_');
					
					var i = parseInt(split[1]);
					var l = parseInt(split[2]);
					
					var type = getTileType(i,l);
					tiles[e.currentTarget.id] = type;
					$("#"+e.currentTarget.id).css("background-image", "url(../img/tiles/ground/"+type.name+".png)");
					$("#"+e.currentTarget.id).css("background-size", "32px");
					console.log(tiles);
				});
				
			}
		}
		
	};
	
	
	
	
	generateTable(21,21);
});