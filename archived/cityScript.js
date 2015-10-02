
var baseCanvas = document.getElementById('baseCanvas');
var bc = baseCanvas.getContext('2d');
bc.fillStyle = 'rgb(255,0,0)';
bc.strokeStyle = 'green';


var travelCanvas = document.getElementById('travelCanvas');
var tc = travelCanvas.getContext('2d');
tc.fillStyle = 'rgba(0,0,0,0.4)';
tc.strokeStyle = 'rgba(0,0,0,1)';
tc.lineWidth = 0.7;


var finalCanvas = document.getElementById('finalCanvas');
var fc = finalCanvas.getContext('2d');
fc.fillStyle = 'rgba(40,40,40,0.5)';
fc.strokeStyle = 'black';
fc.lineWidth = 3;

function trans(sq){//sq contains [center-x, center-y, square size, isResidence]
	var cen = [sq[0],sq[1]];
	var E1 = [sq[0] - 0.5*sq[2], sq[1] - 0.5*sq[2]];
	var E2 = [sq[0] + 0.5*sq[2], sq[1] - 0.5*sq[2]];
	var E3 = [sq[0] + 0.5*sq[2], sq[1] + 0.5*sq[2]];
	var E4 = [sq[0] - 0.5*sq[2], sq[1] + 0.5*sq[2]];
	var E12 = vPrd(vSum(E1,E2),0.5);//midPoint of E1 and E2
	var E23 = vPrd(vSum(E2,E3),0.5);//midPoint of E2 and E3
	var E34 = vPrd(vSum(E3,E4),0.5);//midPoint of E3 and E4
	var E41 = vPrd(vSum(E4,E1),0.5);//midPoint of E4 and E1
	
	var sqN = sq[2]/3;//size of the new squares
	var f1 = sqN*Math.sqrt(2);
	var f2 = sqN;
	
	var c = [];
	c[0] = vSum(vPrd(unitV(vDiff(E1,cen)),sqN*Math.sqrt(2)),cen);
	c[1] = vSum(vPrd(unitV(vDiff(E12,cen)),sqN),cen);
	c[2] = vSum(vPrd(unitV(vDiff(E2,cen)),sqN*Math.sqrt(2)),cen);
	c[3] = vSum(vPrd(unitV(vDiff(E41,cen)),sqN),cen);
	c[4] = cen;
	c[5] = vSum(vPrd(unitV(vDiff(E23,cen)),sqN),cen);
	c[6] = vSum(vPrd(unitV(vDiff(E4,cen)),sqN*Math.sqrt(2)),cen);
	c[7] = vSum(vPrd(unitV(vDiff(E34,cen)),sqN),cen);
	c[8] = vSum(vPrd(unitV(vDiff(E3,cen)),sqN*Math.sqrt(2)),cen);
	
	var theNum;
	if(sq[3]){
		var minParam = 2*baseCanvas.width;//just an impossible large value to start with
		for(var cn = 0; cn < 9; cn++){
			var param = minDist(c[cn]);
			if(minParam > param){
				minParam = param;
				theNum = cn;
			}
		}
	}else{
		var maxParam = 0;//just an impossible large value to start with
		for(var cn = 0; cn < 9; cn++){//console.log(maxDist(c[cn]));
			var param = minDist(c[cn]);
			if(maxParam < param){
				maxParam = param;
				theNum = cn;
			}
		}
		//console.log(maxParam,theNum);
	}
	for(var n = 0; n < 9; n++){
		var isResi = sq[3];
		if(n == theNum){
			var isResi = !sq[3];
		}
		sqStack.push([c[n][0], c[n][1], sqN, isResi]);
	}
}

function lineDSum(pos){//returns the sum of distances from all lines
	var lDSum = 0;
	for(l = 0; l < line.length; l++){
		lDSum += mod(lineDist(line[l][0],line[l][1],pos));
	}
	return lDSum;
}

function minDist(pos){//returns the distance to the closes line
	var dist = 2*baseCanvas.width;
	for(l = 0; l < line.length; l++){
		if(dist > mod(lineDist(line[l][0],line[l][1],pos))){
			dist = mod(lineDist(line[l][0],line[l][1],pos));
		}
	}
	return dist;
}

function maxDist(pos){//returns the distance to the farthest line
	var dist = 0;
	for(l = 0; l < line.length; l++){
		if(dist < mod(lineDist(line[l][0],line[l][1],pos))){
			dist = mod(lineDist(line[l][0],line[l][1],pos));
		}
	}
	return dist;
}

function renderCanvas(){
	bc.clearRect(0,0,1000,1000);
	
	for(var s = 0; s < sqStack.length; s++){//console.log(sqStack[s]);
		if(sqStack[s][3]){
			bc.fillStyle = 'blue';
		}else{
			bc.fillStyle = 'red';
		}
		
		var vrt = [sqStack[s][0] - 0.5*sqStack[s][2], sqStack[s][1] - 0.5*sqStack[s][2]];
		
		bc.fillRect(vrt[0], vrt[1], sqStack[s][2], sqStack[s][2]);
	}
	
	for(l = 0; l < line.length; l++){//console.log(line[l][2]);
		if(line[l][2] == 'nh9'){fc.strokeStyle = 'black'}
		else if(line[l][2] == 'musi'){fc.strokeStyle = 'cyan'}
		fc.beginPath();
		fc.moveTo(line[l][0][0], line[l][0][1]);
		fc.lineTo(line[l][1][0], line[l][1][1]);
		fc.closePath();
		fc.stroke();
	}
}
var sq0 = [500,500,1000,true];
var sqStack = [sq0];

function flatten(){//flattens all the three layers and renders them on bc and hides the other two layers
	tc.drawImage(baseCanvas,0,0);
	tc.drawImage(finalCanvas,0,0);
	
	$('#baseCanvas').hide();
	$('#finalCanvas').hide();
}

function tesellate(){
	var num = sqStack.length;
	for(var s = 0; s < num; s++){
		trans(sqStack.shift());
	}
	renderCanvas();
	//console.log('done');
}

var line = [];
//line.push([[0,100], [1000,900], 'nh9']);
//line.push([[0,666], [1000,500], 'musi']);
line.push([[0,500], [300,000], 'nh9']);
line.push([[250,0], [500,1000], 'musi']);
renderCanvas();

var minLn = 10;//increase this value to 500 to see the basic transformation

var Ln = 1000;
var animateLoop = setInterval(function(){
	tesellate();
	Ln /= 3;
	
	if(Ln <= minLn){
		clearInterval(animateLoop);
		alert('done');
	}
},500);

//flatten();

