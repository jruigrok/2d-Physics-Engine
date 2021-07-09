var deleted = 0;
var pressedKeys = [];
var mouseDown = false;
var mouseX = 0;
var mouseY = 0;
var bodies = [];
var margin = 0;
var e = 0;
var d = 0;
var fps = 0;
var timeChange = 0;
var startTime = new Date();
var seconds = startTime.getSeconds();
var milliSeconds = startTime.getMilliseconds();
var time = seconds + milliSeconds/1000;


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

    function getStandardDeviation(array) {
        const n = array.length
        const mean = array.reduce((a, b) => a + b) / n
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
    }

    function generateRegularPolygon(x,y,r,n,dirz,c,collisionType){
        var X = [];
        var Y = [];
        var a = 0;
        for(var i = 0; i < n; i++){
            X[i] = (Math.sin(a + dirz) * r + x);
            Y[i] = (Math.cos(a + dirz) * r + y);
            a += (Math.PI * 2)/n; 
        }
        bodies.push(new Polygon(X,Y,collisionType,c));
    }

     function find(list,value){
         for(var i = 0; i < list.length; i++){
            if(list[i] == value){
                return i;
            }
         }
     }

    function generateRandomPolygon(xPos,yPos,w,h,n,colType,material,c){
        var x = [];
        var y = [];
        for(var i = 0; i < n; i++){
            x.push(getRndInteger(0,w * 10000) / 10000);
            y.push(getRndInteger(0,h * 10000) / 10000);
        }
        x.sort(function(a, b){return a-b});
        y.sort(function(a, b){return a-b});
        var minX = x[0];
        var maxX = x[x.length - 1];
        var minY = y[0];
        var maxY = y[y.length - 1];
        x.splice(0,1);
        x.splice(x.length - 1,1);
        y.splice(0,1);
        y.splice(y.length - 1,1);
        var x1 = [];
        var x2 = [];
        var y1 = [];
        var y2 = [];
        for(var i = 0; i < x.length; i++){
            switch(getRndInteger(0,1)){
                case 0:
                    x1.push(x[i]);
                    break;
                case 1:
                    x2.push(x[i]);
                    break;
            }
        }
        x1.push(maxX);
        x2.push(maxX);
        x1.unshift(minX);
        x2.unshift(minX);
        for(var i = 0; i < y.length; i++){
            switch(getRndInteger(0,1)){
                case 0:
                    y1.push(y[i]);
                    break;
                case 1:
                    y2.push(y[i]);
                    break;
            }
        }
        y1.push(maxY);
        y2.push(maxY);
        y1.unshift(minY);
        y2.unshift(minY);
        var xVect = [];
        var yVect = [];
        for(var i = 0; i < x1.length - 1; i++){
            xVect.push(x1[i] - x1[i + 1]);
        }
        for(var i = 0; i < x2.length - 1; i++){
            xVect.push(x2[i + 1] - x2[i]);
        }
        for(var i = 0; i < y1.length - 1; i++){
            yVect.push(y1[i] - y1[i + 1]);
        }
        for(var i = 0; i < y2.length - 1; i++){
            yVect.push(y2[i + 1] - y2[i]);
        }
        yVect.sort(function() { return 0.5 - Math.random() });
        var angles = [];
        var angles2 = [];
        for(var i = 0; i < yVect.length; i++){
            var angle = Math.atan(yVect[i]/xVect[i]);
            if(xVect[i] < 0){
                angle += Math.PI;
            }
            angles.push(angle);
            angles2.push(angle)
        }
        angles.sort(function(a, b){return a-b});
        var xVect2 = [];
        var yVect2 = [];
        
        for(var i = 0; i < angles.length; i++){
            j = find(angles,angles2[i]);
            xVect2[j] = xVect[i];
            yVect2[j] = yVect[i];
        }
        var lastX = xPos;
        var lastY = yPos;
        var xf = [];
        var yf = [];
        for(var i = 0; i < xVect2.length; i++){
            xf.push(lastX);
            yf.push(lastY);
            lastX += xVect2[i];
            lastY += yVect2[i];
        }
        bodies.push(new Polygon(xf,yf,colType,material,c));
    }

    function renderFps(){
        ctx.font = '32px arial';
        ctx.strokeStyle = 'rgb(0,255,0)';
        ctx.beginPath();
        ctx.strokeText('FPS: ' + fps,gameArea.width - 150,35);
        ctx.stroke();
    }

    function refreshTime(){
        var currentTime = new Date();
        var newTime = currentTime.getMilliseconds(); - startTime.getMilliseconds();
        var last = time;
        if(newTime < milliSeconds){
            seconds++;
        }
        milliSeconds = newTime;
        time = milliSeconds/1000
        time += seconds;
        timeChange = time - last;
        //fps = Math.round(1 / (time - last));
    }

    function resetCollisions(){
        for(var i = 0; i < bodies.length; i++){
            bodies[i].col = [];
        }
    }

    //Drawing Functions

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

    //objects
    class Circle {
        constructor(x,y,r,collisionType,material,color){
            this.x = x;
            this.y = y;
            this.r = r;
            this.collisionType = collisionType;
            this.color = color;
            this.xVelocity = 0;
            this.yVelocity = 0;
            this.wVelocity = 0;
            this.density = material.density;
            this.restitution = material.restitution;
            this.staticFrict = material.staticFrict;
            this.dynamicFrict = material.dynamicFrict;
            this.minX;
            this.minY;
            this.maxX;
            this.maxY;
            this.GetMinMax();
            this.mass;
            this.area;
            this.inertia;
            this.comX;
            this.comY;
            this.GetValues();
            this.ax = 0;
            this.ay = 0;
            this.angle = 0;
            this.type = 'circle';
            this.col = [];
        }

        GetMinMax(){
            this.minX = this.x - this.r;
            this.minY = this.y - this.r;
            this.maxX = this.x + this.r;
            this.maxY = this.y + this.r;
        }

        GetValues(){
            this.area = Math.PI * (this.r * this.r);
            this.mass = this.area * this.density;
            this.inertia = 0.5 * this.mass * this.r * this.r;
            this.comX = this.x;
            this.comY = this.y;
        }

        Rotate(angle,pointX,pointY){
            this.angle += angle;
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var x = pointX + ((this.x - pointX) * cos) - ((this.y - pointY) * sin);
            var y = pointY + ((this.y - pointY) * cos) + ((this.x - pointX) * sin);
            this.x = x;
            this.y = y;
        }

        Render(){
            drawCircle(this.x,this.y,this.r,this.color,false);
            drawLine(this.x,this.y,this.x + this.r * Math.cos(this.angle),this.y + this.r * Math.sin(this.angle),this.color,1);
            this.Update();
        }

        Update(){

            this.xVelocity += this.ax * timeChange;
            this.yVelocity += this.ay * timeChange;
            this.xVelocity -= this.xVelocity * d * timeChange;
            this.yVelocity -= this.yVelocity * d * timeChange;
            this.wVelocity -= this.wVelocity * d * timeChange;
            this.Move(this.xVelocity * timeChange,this.yVelocity * timeChange);
            if(this.wVelocity != 0){
                this.Rotate(this.wVelocity * timeChange,this.comX,this.comY);
            }

            for(var i = 0; i < bodies.length; i++){
                if(bodies[i] != this){
                    var collide = true;
                    for(var j = 0; j < this.col.length; j++){
                        if(this.col[j] == bodies[i]){
                            collide = false;
                        }
                    }
                    if(collide){
                        checkCollision(this,bodies[i]);
                    }
                }
            }
            this.comX = this.x;
            this.comY = this.y;
        }

        Move(distanceX,distanceY){
            this.x += distanceX;
            this.y += distanceY
            this.GetMinMax();
        }

        MoveTo(x,y){
            this.x = x;
            this.y = y;
            this.GetMinMax();
        }

        ApplyImpulse(axisX,axisY,x,y,j){
            var rx = this.comX - x;
            var ry = this.comY - y;
            this.xVelocity += (j * axisX) / this.mass;
            this.yVelocity += (j * axisY) / this.mass;
            this.wVelocity -= (rx * j * axisY - ry * j * axisX) / this.inertia;
        }

        Delete(){
            var indexToDelete = bodies.indexOf(this);
            bodies.splice(indexToDelete, 1);
            deleted += 1;
        }
    }

    class Polygon {
        constructor(x,y,collisionType,material,color){
            this.x = x;
            this.y = y;
            this.collisionType = collisionType;
            this.color = color;
            this.xVelocity = 0;
            this.yVelocity = 0;
            this.wVelocity = 0;
            this.density = material.density;
            this.restitution = material.restitution;
            this.staticFrict = material.staticFrict;
            this.dynamicFrict = material.dynamicFrict;
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
            this.GetValues();
            this.dx = x[0];
            this.dy = y[0];
            this.sidesX = [];
            this.sidesY = [];
            this.GetMags();
            this.ax = 0;
            this.ay = 0;
            this.angle = 0;
            this.type = 'polygon';
            this.col = [];
        }

        GetMinMax(){
            this.minX = Math.min(...this.x);
            this.minY = Math.min(...this.y);
            this.maxX = Math.max(...this.x);
            this.maxY = Math.max(...this.y);
        }

        GetValues(){
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
            this.angle += angle;
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

            this.xVelocity += this.ax * timeChange;
            this.yVelocity += this.ay * timeChange;
            this.xVelocity -= this.xVelocity * d * timeChange;
            this.yVelocity -= this.yVelocity * d * timeChange;
            this.wVelocity -= this.wVelocity * d * timeChange;
            this.Move(this.xVelocity * timeChange,this.yVelocity * timeChange);
            if(this.wVelocity != 0){
                this.Rotate(this.wVelocity * timeChange,this.comX,this.comY);
            }
            
            for(var i = 0; i < bodies.length; i++){
                if(bodies[i] != this){
                    var collide = true;
                    for(var j = 0; j < this.col.length; j++){
                        if(this.col[j] == bodies[i]){
                            collide = false;
                        }
                    }
                    if(collide){
                        checkCollision(this,bodies[i]);
                    }
                }
            }
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

        ApplyImpulse(axisX,axisY,x,y,j){
            var rx = this.comX - x;
            var ry = this.comY - y;
            this.xVelocity += (j * axisX) / this.mass;
            this.yVelocity += (j * axisY) / this.mass;
            this.wVelocity -= (rx * j * axisY - ry * j * axisX) / this.inertia;
        }

        Delete(){
            var indexToDelete = bodies.indexOf(this);
            bodies.splice(indexToDelete, 1);
            deleted += 1;
        }
    }

    class Material{
        constructor(density,restitution,staticFrict,dynamicFrict){
            this.density = density;
            this.restitution = restitution;
            this.staticFrict = staticFrict;
            this.dynamicFrict = dynamicFrict;
        }
    }


    //collision

    function checkCollision(ob1,ob2){
        ob1.col.push(ob2);
        ob2.col.push(ob1);
        if(!(ob1.maxX >= ob2.maxX && ob2.maxX <= ob1.minX || ob2.minX >= ob1.maxX && ob2.maxX >= ob1.maxX || ob1.maxY >= ob2.maxY && ob2.maxY <= ob1.minY || ob2.minY >= ob1.maxY && ob2.maxY >= ob1.maxY)){
            var collision =  true;
            if(ob1.type == 'polygon' && ob2.type == 'polygon'){
                ob1.GetMags();
                ob2.GetMags();
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
                    min = Infinity;
                    var distances = [];
                    var distanceNum = 0;
                    var x = 0;
                    var y = 0;

                    if(ob1Point + 1 == axisPoints1.length){
                        distances.push( Math.abs(axisPoints1[ob1Point] - axisPoints1[0]) );
                    }else{
                        distances.push( Math.abs(axisPoints1[ob1Point] - axisPoints1[ob1Point + 1]) );
                    }

                    if(ob1Point == 0){
                        distances.push( Math.abs(axisPoints1[ob1Point] - axisPoints1[axisPoints1.length - 1]) );
                    }else{
                        distances.push( Math.abs(axisPoints1[ob1Point] - axisPoints1[ob1Point - 1]) );
                    }

                    if(ob2Point + 1 == axisPoints2.length){
                        distances.push( Math.abs(axisPoints2[ob2Point] - axisPoints2[0]) );
                    }else{
                        distances.push( Math.abs(axisPoints2[ob2Point] - axisPoints2[ob2Point + 1]) );
                    }

                    if(ob2Point == 0){
                        distances.push( Math.abs(axisPoints2[ob2Point] - axisPoints2[axisPoints2.length - 1]) );
                    }else{
                        distances.push( Math.abs(axisPoints2[ob2Point] - axisPoints2[ob2Point - 1]) );
                    }

                    for(var i = 0; i < 4; i++){
                        if(distances[i] < min){
                            min = distances[i];
                            distanceNum = i;
                        }
                    }

                    switch (distanceNum){
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
                    resolveCollision(smallestOverlap,axisX,axisY,ob1,ob2);
                    resolveImpulse(axisX,axisY,ob1,ob2,x,y);
                }

            }else if(ob1.type == 'polygon' && ob2.type == 'circle' || ob2.type == 'polygon' && ob1.type == 'circle'){
                if(ob1.type == 'circle'){
                    var circle = ob1;
                    var polygon = ob2;
                }else{
                    var circle = ob2;
                    var polygon = ob1;
                }
                polygon.GetMags();
                var smallestOverlap = Infinity;
                var axisX = null;
                var axisY = null;
                var type = 0;

                for(var i = 0; i < polygon.numSides; i++){
                    var polygonPoints = [];
                    var circlePoint = 0;
                    for(var j = 0; j < polygon.numSides; j++){
                        let p = polygon.x[j] * polygon.sidesX[i] + polygon.y[j] * polygon.sidesY[i];
                        polygonPoints.push(p);
                    }

                    circlePoint = circle.x * polygon.sidesX[i] + circle.y * polygon.sidesY[i];
                    var polygonMax = Math.max(...polygonPoints);
                    var polygonMin = Math.min(...polygonPoints);
                    var circleMax = circlePoint + circle.r;
                    var circleMin = circlePoint - circle.r;

                    if(!(polygonMin <= circleMax && polygonMin >= circleMin) && !(circleMin <= polygonMax && circleMin >= polygonMin)){
                        collision = false;
                        break;
                    }else{
                        if(Math.abs(circleMin - polygonMax) < Math.abs(circleMax - polygonMin)){
                            var overlap = circleMin - polygonMax;
                            var colType = 0;
                        }else{
                            var overlap = circleMax - polygonMin;
                            var colType = 1;
                        }

                        if(Math.abs(overlap) < Math.abs(smallestOverlap)){
                            smallestOverlap = overlap;
                            axisX = polygon.sidesX[i];
                            axisY = polygon.sidesY[i];
                            type = colType;
                            finalPolygonPoints = polygonPoints;
                            finalCirclePoint = circlePoint;
                        }
                    }
                }

                if(collision){
                    
                    var min = Infinity;
                    var side = 0;
                    for(var i = 0; i < polygon.numSides; i++){
                        var dx = polygon.x[i] - circle.x;
                        var dy = polygon.y[i] - circle.y;
                        var distance = (dx * dx + dy * dy);
                        if(distance < min){
                            side = i;
                            min = distance;
                        }
                    }

                    var dx = polygon.x[side] - circle.x;
                    var dy = polygon.y[side] - circle.y;
                    if(side == polygon.numSides - 1){
                        var dx2 = polygon.x[side] - polygon.x[0];
                        var dy2 = polygon.y[side] - polygon.y[0];
                    }else{
                        var dx2 = polygon.x[side] - polygon.x[side + 1];
                        var dy2 = polygon.y[side] - polygon.y[side + 1];
                    }
                    
                    var dot1 = dx2 * dx + dy2 * dy;
                    if(side > 0){
                        dx2 = polygon.x[side] - polygon.x[side - 1];
                        dy2 = polygon.y[side] - polygon.y[side - 1];
                    }else{
                        dx2 = polygon.x[side] - polygon.x[polygon.numSides - 1];
                        dy2 = polygon.y[side] - polygon.y[polygon.numSides - 1];
                    }
                    var dot2 = dx2 * dx + dy2 * dy;
                    if(dot1 < 0 && dot2 < 0){
                        var dx = polygon.x[side] - circle.x;
                        var dy = polygon.y[side] - circle.y;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        if(distance < circle.r){
                            axisX = dx / distance;
                            axisY = dy / distance;
                            smallestOverlap = distance - circle.r;
                            var x = polygon.x[side];
                            var y = polygon.y[side];
                            resolveCollision(smallestOverlap,axisX,axisY,circle,polygon);
                            resolveImpulse(axisX,axisY,circle,polygon,x,y);
                        }
                    }else{
                        if(type == 1){
                            var x = circle.x + (axisX * circle.r);
                            var y = circle.y + (axisY * circle.r);
                        }else{
                            var x = circle.x - (axisX * circle.r);
                            var y = circle.y - (axisY * circle.r);
                        }

                        resolveCollision(smallestOverlap,axisX,axisY,polygon,circle);
                        resolveImpulse(axisX,axisY,polygon,circle,x,y);
                    }
                }
            }else if(ob1.type == 'circle' && ob2.type == 'circle'){
                var dx = ob2.x - ob1.x;
                var dy = ob2.y - ob1.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < ob1.r + ob2.r){
                    var smallestOverlap = distance - (ob1.r + ob2.r);
                    var axisX = dx / distance;
                    var axisY = dy / distance;
                    var x = ob1.x + (axisX * ob1.r);
                    var y = ob1.y + (axisY * ob1.r);
                    resolveCollision(smallestOverlap,axisX,axisY,ob1,ob2);
                    resolveImpulse(axisX,axisY,ob1,ob2,x,y);   
                }
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
        drawCircle(x,y,5,'rgb(255,0,0)',true);
        var rx1 = ob1.comX - x;
        var ry1 = ob1.comY - y;
        var rx2 = ob2.comX - x;
        var ry2 = ob2.comY - y;
        var rn1 = Math.pow((rx1 * axisY) - (ry1 * axisX),2);
        var rn2 = Math.pow((rx2 * axisY) - (ry2 * axisX),2);
        if(ob1.collisionType == 2 && ob2.collisionType == 2){
            var v1x = (ob1.xVelocity + ob1.wVelocity * ry1) - (ob2.xVelocity + ob2.wVelocity * ry2);
            var v1y = (ob1.yVelocity - ob1.wVelocity * rx1) - (ob2.yVelocity - ob2.wVelocity * rx2);
            var j = (-(1 + (ob1.restitution + ob2.restitution)/2) * (v1x * axisX + v1y * axisY)) / ( (1/ob1.mass) + (1/ob2.mass) + (rn1/ob1.inertia) + (rn2/ob2.inertia) );
            ob2.ApplyImpulse(axisX,axisY,x,y,-j);
            ob1.ApplyImpulse(axisX,axisY,x,y,j);
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            var v1x = (ob1.xVelocity + ob1.wVelocity * ry1);
            var v1y = (ob1.yVelocity - ob1.wVelocity * rx1);
            var j = ( (-(1 + (ob1.restitution + ob2.restitution)/2) * (v1x * axisX + v1y * axisY)) / ( (1/ob1.mass) + (rn1/ob1.inertia) ));
            ob1.ApplyImpulse(axisX,axisY,x,y,j);
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            var v1x = -(ob2.xVelocity + ob2.wVelocity * ry2);
            var v1y = -(ob2.yVelocity - ob2.wVelocity * rx2);
            var j = ( (-(1 + (ob1.restitution + ob2.restitution)/2) * (v1x * axisX + v1y * axisY)) / ( (1/ob2.mass) + (rn2/ob2.inertia) ));
            ob2.ApplyImpulse(axisX,axisY,x,y,-j);
        }

        var rvx = (ob1.xVelocity + ob1.wVelocity * ry1) - (ob2.xVelocity + ob2.wVelocity * ry2);
        var rvy = (ob1.yVelocity - ob1.wVelocity * rx1) - (ob2.yVelocity - ob2.wVelocity * rx2);
        var tanX = rvx - (rvx * axisX + rvy * axisY) * axisX;
        var tanY = -rvy - (rvx * axisX + rvy * axisY) * axisY;
        var mag = Math.sqrt(tanX * tanX + tanY * tanY);
        if(mag > 0){
            tanX /= mag;
            tanY /= mag;
        }else{
            tanX = 0;
            tanY = 0;
        }

        //drawLine(x,y,x + (tanX * 100),y + (tanY *100),'rgb(255,0,0)',10);
        //drawLine(x,y,x + (axisX * 100),y + (axisY *100),'rgb(0,255,0)',10);

        /*var r1 = Math.pow((rx1 * tanY - ry1 * tanX),2);
        var r2 = Math.pow((rx2 * tanY - ry2 * tanX),2);
        if(ob1.collisionType == 2 && ob2.collisionType == 2){
            v1x = (ob1.xVelocity + ob1.wVelocity * ry1) - (ob2.xVelocity + ob2.wVelocity * ry2);
            v1y = (ob1.yVelocity - ob1.wVelocity * rx1) - (ob2.yVelocity - ob2.wVelocity * rx2);
            var jf = -(1 ) * (v1x * tanX + v1y * tanY) / ( (1/ob1.mass) + (1/ob2.mass) + (r1/ob1.inertia) + (r2/ob2.inertia) );
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            v1x = (ob1.xVelocity + ob1.wVelocity * ry1);
            v1y = (ob1.yVelocity - ob1.wVelocity * rx1);
            var jf = -(1 ) * (v1x * tanX + v1y * tanY) / ( (1/ob1.mass) + (r1/ob1.inertia) );
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            v1x = -(ob2.xVelocity + ob2.wVelocity * ry2);
            v1y = -(ob2.yVelocity - ob2.wVelocity * rx2);
            var jf =  -(1 ) * (v1x * tanX + v1y * tanY) / ( (1/ob2.mass) + (r1/ob2.inertia) );
        }

        var mu = Math.sqrt(ob1.staticFrict * ob1.staticFrict + ob2.staticFrict * ob2.staticFrict);
        if(Math.abs(jf) > Math.abs(j * mu)){
            var df = Math.sqrt(ob1.dynamicFrict * ob1.dynamicFrict + ob2.dynamicFrict * ob2.dynamicFrict);
            jf = -j * df;
        }

        if(ob1.collisionType == 2 && ob2.collisionType == 2){
            ob2.ApplyImpulse(tanX,tanY,x,y,-jf);
            ob1.ApplyImpulse(tanX,tanY,x,y,jf);
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            ob1.ApplyImpulse(tanX,tanY,x,y,jf);
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            ob2.ApplyImpulse(tanX,tanY,x,y,-jf);
        }*/


        var jt = -(rvx * tanX + rvy * tanY);
        var r1 = Math.pow((rx1 * tanY - ry1 * tanX),2);
        var r2 = Math.pow((rx2 * tanY - ry2 * tanX),2);
        if(ob1.collisionType == 2 && ob2.collisionType == 2){
            jt /= ((1/ob1.mass) + (1/ob2.mass) + (r1/ob1.inertia) + (r2/ob2.inertia));
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            jt /= ((1/ob1.mass) + (r1/ob1.inertia));
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            jt /= ((1/ob2.mass) + (r2/ob2.inertia));
        }
        var mu = Math.sqrt(ob1.staticFrict * ob1.staticFrict + ob2.staticFrict * ob2.staticFrict);
        var fx;
        var fy;
        if(Math.abs(jt) < j * mu){
            fx = jt * tanX;
            fy = jt * tanY;
        }else{
            var df = Math.sqrt(ob1.dynamicFrict * ob1.dynamicFrict + ob2.dynamicFrict * ob2.dynamicFrict);
            fx = -j * tanX * df;
            fy = -j * tanY * df;
        }
       
        if(ob1.collisionType == 2 && ob2.collisionType == 2){
            ob1.xVelocity += fx / ob1.mass;
            ob1.yVelocity += fy / ob1.mass;
            ob1.wVelocity -= (rx1 * fy - ry1 * fx) / ob1.inertia;
            ob2.xVelocity -= fx / ob2.mass;
            ob2.yVelocity -= fy / ob2.mass;
            ob2.wVelocity += (rx2 * fy - ry2 * fx) / ob2.inertia;
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            ob1.xVelocity += fx / ob1.mass;
            ob1.yVelocity += fy / ob1.mass;
            ob1.wVelocity -= (rx1 * fy - ry1 * fx) / ob1.inertia;
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            ob2.xVelocity -= fx / ob2.mass;
            ob2.yVelocity -= fy / ob2.mass;
            ob2.wVelocity += (rx2 * fy - ry2 * fx) / ob2.inertia;
        }

        
       
        /*if(ob1.collisionType == 2 && ob2.collisionType == 2){
            v1x = (ob1.xVelocity + ob1.wVelocity * ry1) - (ob2.xVelocity + ob2.wVelocity * ry2);
            v1y = (ob1.yVelocity - ob1.wVelocity * rx1) - (ob2.yVelocity - ob2.wVelocity * rx2);
            var jf = -(1 + (ob1.restitution + ob2.restitution)/2) * (v1x * tanX + v1y * tanY) / ( (1/ob1.mass) + (1/ob2.mass) + (r1/ob1.inertia) + (r2/ob2.inertia) );
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            v1x = (ob1.xVelocity + ob1.wVelocity * ry1);
            v1y = (ob1.yVelocity - ob1.wVelocity * rx1);
            var jf = -(1 + (ob1.restitution + ob2.restitution)/2) * (v1x * tanX + v1y * tanY) / ( (1/ob1.mass) + (r1/ob1.inertia) );
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            v1x = -(ob2.xVelocity + ob2.wVelocity * ry2);
            v1y = -(ob2.yVelocity - ob2.wVelocity * rx2);
            var jf =  -(1 + (ob1.restitution + ob2.restitution)/2) * (v1x * tanX + v1y * tanY) / ( (1/ob2.mass) + (r1/ob2.inertia) );
        }

        
        //console.log('j  ' + Math.abs(j * mu));
        //console.log('jf  ' + Math.abs(jf));
        if(true){
            var df = Math.sqrt(ob1.dynamicFrict * ob1.dynamicFrict + ob2.dynamicFrict * ob2.dynamicFrict);
            jf = -j * df;
        }

        if(ob1.collisionType == 2 && ob2.collisionType == 2){
            ob2.ApplyImpulse(tanX,tanY,x,y,-jf);
            ob1.ApplyImpulse(tanX,tanY,x,y,jf);
        }else if(ob1.collisionType == 2 && ob2.collisionType == 1){
            ob1.ApplyImpulse(tanX,tanY,x,y,-jf);
        }else if(ob1.collisionType == 1 && ob2.collisionType == 2){
            ob2.ApplyImpulse(tanX,tanY,x,y,-jf);
        }*/
    }

    //Object Generation

    var wood = new Material(0.6,0.5,1,0.1);
    bodies.push(new Polygon([0,0,50,50],[0,gameArea.height,gameArea.height,0],1,wood,'rgb(255,0,0)'));
    bodies.push(new Polygon([gameArea.width,gameArea.width,gameArea.width - 50,gameArea.width - 50],[0,gameArea.height,gameArea.height,0],1,wood,'rgb(255,0,0)'));
    bodies.push(new Polygon([50,50,gameArea.width - 50,gameArea.width - 50],[0,50,50,0],1,wood,'rgb(255,0,0)'));
    bodies.push(new Polygon([50,50,gameArea.width - 50,gameArea.width - 50],[gameArea.height,gameArea.height - 250,gameArea.height - 50,gameArea.height],1,wood,'rgb(255,0,0)'));

    //bodies.push(new Circle(500,500,50,2,wood,'rgb(255,0,0)'));
    //bodies[4].xVelocity = 100;
    
    for(var i = 0; i < 5; i++){
        generateRandomPolygon(250,500,250,250,getRndInteger(10,20),2,wood,'rgb(100,100,100)');
        //bodies[bodies.length - 1].xVelocity = getRndInteger(-100,100);
        //bodies[bodies.length - 1].yVelocity = getRndInteger(-100,100);
        //bodies[bodies.length - 1].wVelocity = getRndInteger(-10,10);
        bodies.push(new Circle(250,500,getRndInteger(125,75),2,wood,'rgb(100,100,100)'));
        //bodies[bodies.length - 1].xVelocity = getRndInteger(-100,100);
        //bodies[bodies.length - 1].yVelocity = getRndInteger(-100,100);
        //bodies[bodies.length - 1].wVelocity = getRndInteger(-10,10);
    }
    for(var i = 4; i < bodies.length; i ++){
        bodies[i].ay = 1000;
    }
    
    
    function refresh(){
        draw.clearRect(0, 0, gameArea.width, gameArea.height);
        refreshTime();
        renderObject(bodies);
        resetCollisions();
        window.requestAnimationFrame(refresh);
    }
    window.requestAnimationFrame(refresh);
}

draw();