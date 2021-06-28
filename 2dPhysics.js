var deleted = 0;
var pressedKeys = [];
var mouseDown = false;
var mouseX = 0;
var mouseY = 0;
var polygons = [];
var margin = 0.4;
var e = 0.5;
var time = 0;


function draw() {
    

    //basic functions
    

    gameArea.width = window.innerWidth;
    gameArea.height = window.innerHeight;
    var ctx = gameArea.getContext('2d');
  
    if (gameArea.getContext) {
      var draw = gameArea.getContext('2d');
    }
  
    document.body.onmousedown = function() {
      ++mouseDown;
    }
    document.body.onmouseup = function() {
      --mouseDown;
      click = false;
    }
  
    function getMousePosition(canvas, event) {
      let rect = gameArea.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    }
  
    gameArea.addEventListener('mousemove', function(e) {
      getMousePosition('gameArea', e);
    });
  
    window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
    window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }
  
    function getRndInteger(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function drawLine(x1,y1,x2,y2,c,w){
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.strokeStyle = c;
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    function drawPolygon(x,y,c,fill){
        ctx.beginPath();
        ctx.strokeStyle = c;
        ctx.moveTo(x[0],y[0]);
        for(var i = 1; i < x.length; i++){
          ctx.lineTo(x[i],y[i]);
        }
        ctx.closePath();
        if(fill){
          ctx.fillStyle = c;
          ctx.fill();
        }
        ctx.stroke();
    }

    function drawCircle(x, y, r, c,fill) {
        ctx.beginPath();
        ctx.strokeStyle = c;
        ctx.lineWidth = 1;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = c;
        if(fill){
          ctx.fill();
        }
        ctx.stroke();
    }

    function renderObject(object){
    deleted = 0;
        for (var i = 0; i < object.length; i++){
            deleted = 0;
            object[i].Render();
            i -= deleted;
        }
    }

    function regularPolygon(x,y,r,n,dirz,c,collisionType){
        var X = [];
        var Y = [];
        var a = 0;
        for(var i = 0; i < n; i++){
            X[i] = (Math.sin(a + dirz) * r + x);
            Y[i] = (Math.cos(a + dirz) * r + y);
            a += (Math.PI * 2)/n; 
        }
        polygons.push(new Polygon(X,Y,collisionType,c));
    }


    //objects



    class Polygon {

        constructor(x,y,collisionType,color){
            this.x = x;
            this.y = y;
            this.collisionType = collisionType;
            this.color = color;
            this.xVelocity = 0;
            this.yVelocity = 0;
            this.wVelocity = 0;
            this.density = 1;
            this.numSides = this.x.length;
            this.minX;
            this.minY;
            this.maxX;
            this.maxY;
            this.GetMinMax();
            this.comX;
            this.comY;
            this.mass;
            this.area;
            this.inertia;
            this.GetPolygonValues();
            this.dx = x[0];
            this.dy = y[0];
            this.sidesX = [];
            this.sidesY = [];
            this.GetMags();
            this.ax = 0;
            this.ay = 0;
            this.time = 0;
        }

        GetMinMax(){
            this.minX = Math.min(...this.x);
            this.minY = Math.min(...this.y);
            this.maxX = Math.max(...this.x);
            this.maxY = Math.max(...this.y);
        }

        GetPolygonValues(){
            var x = ((this.maxX - this.minX)/2) + this.minX;
            var y = ((this.maxY - this.minY)/2) + this.minY;
            var inertia = 0;
            var areas = [];
            var comXs = [];
            var comYs = [];
            this.x.push(this.x[0]);
            this.y.push(this.y[0]);
            for(var i = 0; i < this.x.length - 1; i++){
                var dxa = x - this.x[i];
                var dya = y - this.y[i];
                var dxb = x - this.x[i + 1];
                var dyb = y - this.y[i + 1];
                var area = Math.abs(((dxa * dyb) - (dxb * dya))/2);
                areas.push(area);
                comXs.push((this.x[i] + this.x[i+1] + x)/3);
                comYs.push((this.y[i] + this.y[i+1] + y)/3);
                inertia += area * ((dxa * dxa + dya * dya) + (dxb * dxb + dyb * dyb) + (dxa * dxb + dya * dyb))/6;
            }
            this.area = 0;
            for(var i = 0; i < areas.length; i++){
                this.area += areas[i];
            }
            this.comX = 0;
            this.comY = 0;
            for(var i = 0; i < comXs.length; i++){
                this.comX += (comXs[i] * areas[i]);
                this.comY += (comYs[i] * areas[i]);
            }
            this.comX /= this.area;
            this.comY /= this.area;
            this.inertia = inertia * this.density;
            var centerX = x - this.comX;
            var centerY = y - this.comY;
            this.inertia -= this.area * (centerX * centerX + centerY * centerY);
            this.mass = this.area * this.density;
            this.y.pop();
            this.x.pop();
        }

        Rotate(angle,pointX,pointY){
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            for(var i = 0; i < this.numSides; i++){
                var x = pointX + ((this.x[i] - pointX) * cos) - ((this.y[i] - pointY) * sin);
                var y = pointY + ((this.y[i] - pointY) * cos) + ((this.x[i] - pointX) * sin);
                this.x[i] = x;
                this.y[i] = y;
            }
            this.comX = pointX + ((this.comX - pointX) * cos) - ((this.comY - pointY) * sin);
            this.comY = pointY + ((this.comY - pointY) * cos) + ((this.comX - pointX) * sin);
            this.GetMinMax();
        }

        GetMags(){
            this.sidesX = [];
            this.sidesY = [];
            for(var i = 0; i < this.numSides - 1; i++){
                var mag = Math.sqrt(Math.pow(this.y[i + 1] - this.y[i],2) + Math.pow(this.x[i + 1] - this.x[i],2));
                this.sidesX.push(-(this.y[i + 1] - this.y[i])/ mag);
                this.sidesY.push((this.x[i + 1] - this.x[i]) / mag);
            }
            var mag = Math.sqrt(Math.pow(this.y[0] - this.y[this.numSides - 1],2) + Math.pow(this.x[0] - this.x[this.numSides - 1],2));
            this.sidesX.push(-(this.y[0] - this.y[this.numSides - 1]) / mag);
            this.sidesY.push((this.x[0] - this.x[this.numSides - 1]) / mag);
        }

        Render(){
            this.Update();
            drawPolygon(this.x,this.y,this.color,false);
        }

        Update(){
            var timeChange = time - this.time
            this.Move(this.xVelocity * timeChange,this.yVelocity * timeChange);
            
            if(this.wVelocity != 0){
                this.Rotate(this.wVelocity * timeChange,this.comX,this.comY);
            }
            this.time = time;
            for(var i = 0; i < polygons.length; i++){
                if(polygons[i] != this){
                    checkCollision(this,polygons[i]);
                }
            }
            this.xVelocity += this.ax * timeChange;
            this.yVelocity += this.ay * timeChange;
        }
        
        Move(distanceX,distanceY){
            for(var i = 0; i < this.numSides; i++){
                this.x[i] += distanceX;
                this.y[i] += distanceY;
            }
            this.dx += distanceX;
            this.dy += distanceY;
            this.comX += distanceX;
            this.comY += distanceY;
            this.GetMinMax();
        }

        MoveTo(x,y){
            var dx = this.dx - x;
            var dy = this.dy - y;
            this.Move(-dx,-dy);
        }

        Delete(){
            var indexToDelete = polygons.indexOf(this);
            polygons.splice(indexToDelete, 1);
            deleted += 1;
        }
    }


    //collision


    function checkCollision(ob1,ob2){
        if(!(ob1.maxX >= ob2.maxX && ob2.maxX <= ob1.minX || ob2.minX >= ob1.maxX && ob2.maxX >= ob1.maxX || ob1.maxY >= ob2.maxY && ob2.maxY <= ob1.minY || ob2.minY >= ob1.maxY && ob2.maxY >= ob1.maxY)){
            ob1.GetMags();
            ob2.GetMags();
            var collision = true;
            var sidesX = ob1.sidesX.concat(ob2.sidesX);
            var sidesY = ob1.sidesY.concat(ob2.sidesY);
            var smallestOverlap = Infinity;
            var axisX = null;
            var axisY = null;
            var type = 0;
            var axisPoints1 = [];
            var axisPoints2 = [];
            for(var i = 0; i < sidesX.length; i++){
                var ob1Points = [];
                var ob2Points = [];
                
                for(var j = 0; j < ob1.numSides; j++){
                    let p = ob1.x[j] * sidesX[i] + ob1.y[j] * sidesY[i];
                    ob1Points.push(p);
                }
                for(var j = 0; j < ob2.numSides; j++){
                    let p = ob2.x[j] * sidesX[i] + ob2.y[j] * sidesY[i];
                    ob2Points.push(p);
                }

                var ob1Max = Math.max(...ob1Points);
                var ob1Min = Math.min(...ob1Points);
                var ob2Max = Math.max(...ob2Points);
                var ob2Min = Math.min(...ob2Points);
                
                if(!(ob1Min <= ob2Max && ob1Min >= ob2Min) && !(ob2Min <= ob1Max && ob2Min >= ob1Min)){
                    collision = false;
                    break;
                }else{
                    if(Math.abs(ob2Min - ob1Max) < Math.abs(ob2Max - ob1Min)){
                        var overlap = ob2Min - ob1Max;
                        var colType = 0;
                    }else{
                        var overlap = ob2Max - ob1Min;
                        var colType = 1;
                    }

                    if(Math.abs(overlap) < Math.abs(smallestOverlap)){
                        smallestOverlap = overlap;
                        axisX = sidesX[i];
                        axisY = sidesY[i]; 
                        type = colType;
                        axisPoints1 = ob1Points;
                        axisPoints2 = ob2Points;
                    }
                }
            }
            
            
            if(collision){
                var ob1Point = 0;
                var ob2Point = 0;
                var min = Infinity;
                var max = -Infinity;

                if(type == 0){
                    for(var i = 0; i < axisPoints1.length; i++){
                        if(axisPoints1[i] > max){
                            max = axisPoints1[i]
                            ob1Point = i;
                        }
                    }
                    for(var i = 0; i < axisPoints2.length; i++){
                        if(axisPoints2[i] < min){
                            min = axisPoints2[i]
                            ob2Point = i;
                        }
                    }
                }else{
                    for(var i = 0; i < axisPoints1.length; i++){
                        if(axisPoints1[i] < min){
                            min = axisPoints1[i]
                            ob1Point = i;
                        }
                    }
                    for(var i = 0; i < axisPoints2.length; i++){
                        if(axisPoints2[i] > max){
                            max = axisPoints2[i]
                            ob2Point = i;
                        }
                    }
                }
                //min = Infinity;
                //var distances = [];
                //var distanceNum = 0;
                //var x = 0;
                //var y = 0;
                var distance1 = 0;
                var distance2 = 0;
                var ob1Point2 = 0;
                var ob2Point2 = 0;
                var ob1Distance = 0;
                var ob2Distance = 0;

                if(ob1Point + 1 == axisPoints1.length){
                    distance1 = Math.abs(axisPoints1[ob1Point] - axisPoints1[0]);
                }else{
                    distance1 = Math.abs(axisPoints1[ob1Point] - axisPoints1[ob1Point + 1]);
                }

                if(ob1Point == 0){
                    distance2 = Math.abs(axisPoints1[ob1Point] - axisPoints1[axisPoints1.length - 1]);
                }else{
                    distance2 = Math.abs(axisPoints1[ob1Point] - axisPoints1[ob1Point - 1]);
                }

                if(distance1 < distance2){
                    if(ob1Point + 1 == axisPoints1.length){
                        ob1Point2 = 0;
                    }else{
                        ob1Point2 = ob1Point + 1;
                    }
                    ob1Distance = distance1;
                }else{
                    if(ob1Point == 0){
                        ob1Point2 = axisPoints1.length - 1;
                    }else{
                        ob1Point2 = ob1Point - 1;
                    }
                    ob1Distance = distance2;
                }

                if(ob2Point + 1 == axisPoints2.length){
                    distance1 = Math.abs(axisPoints2[ob2Point] - axisPoints2[0]);
                }else{
                    distance1 = Math.abs(axisPoints2[ob2Point] - axisPoints2[ob2Point + 1]);
                }

                if(ob2Point == 0){
                    distance2 = Math.abs(axisPoints2[ob2Point] - axisPoints2[axisPoints2.length - 1]);
                }else{
                    distance2 = Math.abs(axisPoints2[ob2Point] - axisPoints2[ob2Point - 1]);
                }

                if(distance1 < distance2){
                    if(ob2Point + 1 == axisPoints2.length){
                        ob2Point2 = 0;
                    }else{
                        ob2Point2 = ob2Point + 1;
                    }
                    ob2Distance = distance1;
                }else{
                    if(ob2Point == 0){
                        ob2Point2 = axisPoints2.length - 1;
                    }else{
                        ob2Point2 = ob2Point - 1;
                    }
                    ob2Distance = distance2;
                }

                var point = false;
                
                if(ob1Distance > ob2Distance){
                    if(type == 0){
                        if(axisPoints1[ob1Point2] > axisPoints2[ob2Point]){
                            point = true;
                        }
                    }else{
                        if(axisPoints1[ob1Point2] < axisPoints2[ob2Point]){
                            point = true;
                        }
                    }
                    if(point){
                        resolveImpulse(axisX,axisY,ob1,ob2, (ob1.x[ob1Point2] + ob1.x[ob1Point]) / 2, (ob1.y[ob1Point2] + ob1.y[ob1Point]) / 2);
                    }else{
                        resolveImpulse(axisX,axisY,ob1,ob2,ob1.x[ob1Point],ob1.y[ob1Point]);
                    }
                }else{
                    if(type == 0){
                        if(axisPoints2[ob2Point2] > axisPoints1[ob1Point]){
                            point = true;
                        }
                    }else{
                        if(axisPoints2[ob2Point2] < axisPoints1[ob1Point]){
                            point = true;
                        }
                    }
                    if(point){
                        resolveImpulse(axisX,axisY,ob1,ob2,(ob2.x[ob2Point2] + ob2.x[ob2Point]) / 2, (ob2.y[ob2Point2] + ob2.y[ob2Point]) / 2);
                    }else{
                        resolveImpulse(axisX,axisY,ob1,ob2,ob2.x[ob2Point],ob2.y[ob2Point]);
                    }
                }

                resolveCollision(smallestOverlap,axisX,axisY,ob1,ob2);
                if(point){
                    console.log(1);
                }

                /*switch (distanceNum){
                    case 0:
                        x = ob2.x[ob2Point];
                        y = ob2.y[ob2Point];
                        break;
                    case 1:
                        x = ob2.x[ob2Point];
                        y = ob2.y[ob2Point];
                        break;
                    case 2:
                        x = ob1.x[ob1Point];
                        y = ob1.y[ob1Point];
                        break;
                    case 3:
                        x = ob1.x[ob1Point];
                        y = ob1.y[ob1Point];
                        break;
                }

                resolveSpinning(axisX,axisY,ob1,ob2,x,y);*/
            }
        }
    }

    function resolveCollision(smallestOverlap,axisX,axisY,ob1,ob2){
        if(smallestOverlap >= 0){
            var marginOverlap = smallestOverlap + margin;
        }else{
            var marginOverlap = smallestOverlap - margin;
        }
        if( (ob1.collisionType == 0 || ob1.collisionType == 2) && (ob2.collisionType == 0 || ob2.collisionType == 2) ){
            ob1.Move(marginOverlap * axisX / 2,marginOverlap * axisY / 2);
            ob2.Move(-marginOverlap * axisX / 2,-marginOverlap * axisY / 2);
        }else if(ob1.collisionType == 1 && (ob2.collisionType == 0 || ob2.collisionType == 2) ){
            ob2.Move(-marginOverlap * axisX,-marginOverlap * axisY);
        }else if( (ob1.collisionType == 0 || ob1.collisionType == 2) && ob2.collisionType == 1){
            ob1.Move(marginOverlap * axisX,marginOverlap * axisY);
        }
    }

    function resolveImpulse(axisX,axisY,ob1,ob2,x,y){
        var rx1 = ob1.comX - x;
        var ry1 = ob1.comY - y;
        var rx2 = ob2.comX - x;
        var ry2 = ob2.comY - y;
        var v1x = (ob1.xVelocity + ob1.wVelocity * ry1) - (ob2.xVelocity + ob2.wVelocity * ry2);
        var v1y = (ob1.yVelocity - ob1.wVelocity * rx1) - (ob2.yVelocity - ob2.wVelocity * rx2);
        var rn1 = Math.pow((rx1 * axisY) - (ry1 * axisX),2);
        var rn2 = Math.pow((rx2 * axisY) - (ry2 * axisX),2);
        if(ob1.collisionType == 2 && ob2.collisionType == 2){
            var j = ( (-(1 + e) * (v1x * axisX + v1y * axisY)) / ( (1/ob1.mass) + (1/ob2.mass) + (rn1/ob1.inertia) + (rn2/ob2.inertia) ));
            ob1.xVelocity += (j * axisX) / ob1.mass;
            ob1.yVelocity += (j * axisY) / ob1.mass;
            ob2.xVelocity -= (j * axisX) / ob2.mass;
            ob2.yVelocity -= (j * axisY) / ob2.mass;
            ob1.wVelocity -= (rx1 * j * axisY - ry1 * j * axisX) / ob1.inertia; 
            ob2.wVelocity += (rx2 * j * axisY - ry2 * j * axisX) / ob2.inertia;
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            v1x = (ob1.xVelocity + ob1.wVelocity * ry1);
            v1y = (ob1.yVelocity - ob1.wVelocity * rx1);
            var j = ( (-(1 + e) * (v1x * axisX + v1y * axisY)) / ( (1/ob1.mass) + (rn1/ob1.inertia) ));
            ob1.xVelocity += (j * axisX) / ob1.mass;
            ob1.yVelocity += (j * axisY) / ob1.mass;
            ob1.wVelocity -= (rx1 * j * axisY - ry1 * j * axisX) / ob1.inertia; 
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            v1x = -(ob2.xVelocity + ob2.wVelocity * ry2);
            v1y = -(ob2.yVelocity - ob2.wVelocity * rx2);
            var j = ( (-(1 + e) * (v1x * axisX + v1y * axisY)) / ( (1/ob2.mass) + (rn2/ob2.inertia) ));
            ob2.xVelocity -= (j * axisX) / ob2.mass;
            ob2.yVelocity -= (j * axisY) / ob2.mass;
            ob2.wVelocity += (rx2 * j * axisY - ry2 * j * axisX) / ob2.inertia;
        }
    }


    polygons.push(new Polygon([0,0,50,50],[0,gameArea.height,gameArea.height,0],1,'rgb(255,0,0)'));
    polygons.push(new Polygon([gameArea.width,gameArea.width,gameArea.width - 50,gameArea.width - 50],[0,gameArea.height,gameArea.height,0],1,'rgb(255,0,0)'));
    polygons.push(new Polygon([50,50,gameArea.width - 50,gameArea.width - 50],[0,50,50,0],1,'rgb(255,0,0)'));
    polygons.push(new Polygon([50,50,gameArea.width - 50,gameArea.width - 50],[gameArea.height,gameArea.height - 50,gameArea.height - 50,gameArea.height],1,'rgb(255,0,0)'));

    /*polygons.push(new Polygon([500,800,800,500],[500,500,525,525],1,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([500,525,525,500],[500,500,525,525],2,'rgb(0,255,0)'));
    polygons.push(new Polygon([1000,1025,1025,1000],[400,400,425,425],2,'rgb(0,255,0)'));*/
    //polygons[polygons.length - 1].xVelocity = -15;
    for(var i = 0; i < 1; i++){
        regularPolygon(gameArea.width/2,gameArea.height/2,getRndInteger(10,15),getRndInteger(3,5),getRndInteger(0,360),'rgb(255,0,0)',2);
        polygons[polygons.length - 1].xVelocity = getRndInteger(-1000,1000)/5;
        polygons[polygons.length - 1].yVelocity = getRndInteger(-1000,1000)/5;
        polygons[polygons.length - 1].wVelocity = getRndInteger(-50,50)/5;
    }
    for(var i = 4; i < polygons.length; i ++){
        polygons[i].ay = 1000;
    }

    //Time

    setInterval(timeUpdate, 10);

    function timeUpdate(){
        time += 0.01;
    }

    //Drawing and Updating

    function refresh(){
        //polygons[0].MoveTo(mouseX,mouseY);
        draw.clearRect(0, 0, gameArea.width, gameArea.height);
        renderObject(polygons);
        window.requestAnimationFrame(refresh);
    }
    window.requestAnimationFrame(refresh);
}

draw();