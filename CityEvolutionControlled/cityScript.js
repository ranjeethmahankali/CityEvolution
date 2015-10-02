
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

var hubFactor = 0.3;//relative importance of hubs when making roads

function intrcpt(e1,e2,sq){
	var vt = [];
	var cen = [sq[0],sq[1]];
	var dx = [sq[2]/2,0];
	var dy = [0,sq[2]/2];
	var pt = [];//contains final points of Intersection of the Line and the square
	
	vt[0] = vDiff(cen,vSum(dx,dy));
	vt[1] = vSum(cen,vDiff(dx,dy));
	vt[2] = vSum(cen,vSum(dx,dy));
	vt[3] = vSum(cen,vDiff(dy,dx));
	
	for(n in vt){
		vt[n] = roundOff(vt[n],1);
	}
	
	var foundFirst = false;
	var foundSecond = false;
	
	for(var n = 0; n < vt.length;  n++){
		var n2 = (n+1)%4;//this is the next vertex in the cyclic order
		if(Intersects(e1,e2,vt[n],vt[n2])){
			//console.log(e1,e2,vt[n],vt[n2]);
			pt.push(intPt(e1,e2,vt[n],vt[n2]));
			if(!foundFirst && !foundSecond){
				foundFirst = true;
			}else if(foundFirst && !foundSecond){
				foundSecond = true;
			}
		}
		if(foundFirst && foundSecond){break;}
	}
	
	if(foundFirst && foundSecond){
		//markPt(pt[0],fc);markPt(pt[1],fc);
		if(dot(vDiff(e2,e1),vDiff(pt[0],e1)) < 0){
			pt[0] = e1;
		}else if(dot(vDiff(e1,e2),vDiff(pt[0],e2)) < 0){
			pt[0] = e2;
		}
		
		if(dot(vDiff(e2,e1),vDiff(pt[1],e1)) < 0){
			pt[1] = e1;
		}else if(dot(vDiff(e1,e2),vDiff(pt[1],e2)) < 0){
			pt[1] = e2;
		}
		return mod(vDiff(pt[0],pt[1]));
	}else{
		return 0;
	}
}

function intSum(sq){//returns the sum of all Intercepts
	var iSum = 0;
	for(l in line){
		iSum += intrcpt(line[l][0],line[l][1],sq);
	}
	return iSum;
}

function uSum(sqn,pos){
	var hubSum = [0,0];//contribution from other commercial hubs
	
	for(s in sqStack){
		if(sqStack[s][3]){continue;}
		if(s == sqn){continue;}
		var sqPos = [sqStack[s][0], sqStack[s][1]];
		hubSum = vSum(hubSum,unitV(vDiff(sqPos,pos)));
	}
	hubSum = unitV(hubSum);
	return hubSum;
}

function roadPt(sqn){//calculates the critical point and moves the drawing head to that point
	var stp=5;//this is the length of each step
	//console.log(sqStack[sqn]);
	var pos = [sqStack[sqn][0],sqStack[sqn][1]];
	var lSum =  minDistPt(pos);//contribution from lines i.e. roads
	if(mod(lSum[0]) == 0){
		return pos;
	}else{
		switch(lSum[2]){
			case 1:{
				var hubSum = vPrd(uSum(sqn,pos),mod(lSum[0])*hubFactor);
				lUnit = unitV(vDiff(line[lSum[1]][0],line[lSum[1]][1]));
				return vSum(pos,vSum(lSum[0],vPrd(lUnit,dot(hubSum,lUnit))));
				break;
			}
			case 2 :
			case 3 : {
				return vSum(pos,lSum[0]);
			}
		}
	}
}

function makeRoads(){
	for(s in sqStack){
		if(sqStack[s][3]){continue;}
		var initPt = [sqStack[s][0],sqStack[s][1]];
		var finPt = roadPt(s);
		line.push([initPt,finPt,'road']);
	}
}

function Intersects(e1,e2,p1,p2){//this is tailored for this program only. - returns whether those line intersect or not
	var sameSide1 = false;
	var sameSide2 = false;
	
	var d1 = lineDist(e1,e2,p1);
	var d2 = lineDist(e1,e2,p2);
	if(cosAng(d1,d2) > 0){
		return false;
	}else{
		/*d1 = lineDist(p1,p2,e1);
		d2 = lineDist(p1,p2,e2);
		
		if(cosAng(d1,d2) > 0){
			return false;
		}else{
			return true;
		}*/
		return true;
	}
}

function intPt(e1,e2,p1,p2){//gives the point of intersection of the line Segments joining e1,e2 and p1,p2
	if(Intersects(e1,e2,p1,p2)){
		var a = e1;
		var b = unitV(vDiff(e2,e1));
		var c = p1;
		var d = unitV(vDiff(p2,p1));
		
		var k = (a[0]*b[1] - a[1]*b[0] - c[0]*b[1] + c[1]*b[0])/(d[0]*b[1] - d[1]*b[0]);
		
		var intrPt = vSum(c,vPrd(d,k));
		return intrPt;
	}else{
		return false;
	}
}

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
		var minParam = 0;//intercept Sum
		var minParam2 = 2*baseCanvas.width;//just an impossible large value to start with
		for(var cn = 0; cn < 9; cn++){
			var param1 = intSum(sq);
			var param2 = minDist(c[cn]);
			if(minParam < param1){
				minParam = param1;
				theNum = cn;
			}else if(minParam == param1){
				if(param2 < minParam2){
					theNum = cn;
					minParam2 = param2;
				}
			}
		}
	}else{
		var minParam = 0;//intercept Sum
		var maxParam = 0;//just an impossible large value to start with
		for(var cn = 0; cn < 9; cn++){//console.log(maxDist(c[cn]));
			var param1 = intSum(sq);
			var param2 = minDist(c[cn]);
			if(param1 > minParam){
				minParam = param1;
				theNum = cn;
			}else if(param1 == minParam){
				if(maxParam < param2){
					maxParam = param2;
					theNum = cn;
				}
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

function isPassing(ln,sq){//returns true if line ln passes through the square sq
	var e1 = ln[0];
	var e2 = ln[1];
	var E = [];
	E[0] = [sq[0] - 0.5*sq[2], sq[1] - 0.5*sq[2]];
	E[1] = [sq[0] + 0.5*sq[2], sq[1] - 0.5*sq[2]];
	E[2] = [sq[0] + 0.5*sq[2], sq[1] + 0.5*sq[2]];
	E[3] = [sq[0] - 0.5*sq[2], sq[1] + 0.5*sq[2]];
	
	var d=[];
	var dSum = [0,0];
	var dModSum = 0;
	for(var n = 0; n < E.length; n++){
		d[n] = lineDist(e1,e2,E[n]);
		dSum = vSum(dSum, d[n]);
		dModSum += mod(d[n]);
	}
	
	if(Math.abs(dModSum-mod(dSum)) < 0.01){
		return false;
	}else{
		return true;
	}
}

function lineDSum(pos){
	var lDSum = 0;
	for(l = 0; l < line.length; l++){
		lDSum += mod(lineDist(line[l][0],line[l][1],pos));
	}
	return lDSum;
}

function minDist(pos){
	var minD = 2*baseCanvas.width;
	for(l = 0; l < line.length; l++){
		var dist;
		if(dot(vDiff(pos,line[l][0]),vDiff(line[l][1],line[l][0])) >= 0 && dot(vDiff(pos,line[l][1]),vDiff(line[l][0],line[l][1])) > 0){
			dist = mod(lineDist(line[l][0],line[l][1],pos));
		}else if(dot(vDiff(pos,line[l][0]),vDiff(line[l][1],line[l][0])) < 0){
			dist = mod(vDiff(pos,line[l][0]));
		}else if(dot(vDiff(pos,line[l][1]),vDiff(line[l][0],line[l][1])) < 0){
			dist = mod(vDiff(pos,line[l][1]));
		}
		if(minD > dist){
			minD = dist;
		}
	}
	return minD;
}

function minDistPt(pos){
	var minD = 2*baseCanvas.width;
	var lDist = [];
	var ln;
	var orien;
	for(l = 0; l < line.length; l++){
		if(dot(vDiff(pos,line[l][0]),vDiff(line[l][1],line[l][0])) >= 0 && dot(vDiff(pos,line[l][1]),vDiff(line[l][0],line[l][1])) >= 0){
			var dist = lineDist(line[l][0],line[l][1],pos);
			orien = 1;
		}else if(dot(vDiff(pos,line[l][0]),vDiff(line[l][1],line[l][0])) < 0){
			var dist = vDiff(pos,line[l][0]);
			orien = 2;
		}else if(dot(vDiff(pos,line[l][1]),vDiff(line[l][0],line[l][1])) < 0){
			var dist = vDiff(pos,line[l][1]);
			orien = 3;
		}
		
		if(minD > mod(dist)){
			lDist = dist;
			minD = mod(dist);
			ln = l;
		}
	}
	return [lDist,ln,orien];
}

function maxDist(pos){
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
		fc.strokeStyle = 'black';
		fc.beginPath();
		fc.moveTo(line[l][0][0], line[l][0][1]);
		fc.lineTo(line[l][1][0], line[l][1][1]);
		fc.closePath();
		fc.stroke();
	}
}

function flatten(){//flattens all the three layers and renders them on bc and hides the other two layers
	tc.drawImage(baseCanvas,0,0);
	tc.drawImage(finalCanvas,0,0);
	
	$('#baseCanvas').hide();
	$('#finalCanvas').hide();
}

var sq0 = [500,500,1000,true];
var sqStack = [sq0];

function tesellate(){
	var num = sqStack.length;
	for(var s = 0; s < num; s++){
		trans(sqStack.shift());
	}
	//console.log('done');
}

var line = [];
//line.push([[0,100], [1000,900], 'nh9']);
//line.push([[0,666], [1000,500], 'musi']);
line.push([[0,500], [300,000], 'nh9']);
line.push([[250,0], [500,1000], 'musi']);
tesellate();

var minLn = 1000;//increase this value to 500 to see the basic transformation

var Ln = 1000;
/*var animateLoop = setInterval(function(){
	tesellate();
	makeRoads();
	renderCanvas();
	Ln /= 3;
	
	if(Ln <= minLn){
		clearInterval(animateLoop);
		alert('done');
	}
},10);*/

renderCanvas();