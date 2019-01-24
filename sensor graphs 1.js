var $svg = d3.select("#mainSVG");

var maxHistory = 1000;
var tDuration = 200;

var pointSpacing = 2;
var lineDxDt = 5;
var graphHeight = 50;
var graphSpacing = 20;
var boxPad = 3;
var maxSample = 100;

var maxCurveH = 30;
var curveW = 100;
var tanW = .4;

var dotRadius = 5;

var meterW = 35;
var meterH = 140;
var meterSpacing = 25;

var t0 = Date.now()
var sensorHistory = {left:[], right:[]};
// [[1,3,4,20,30.., time=234234]]
var currentSamples = {left: arrayFill(8,0), right: arrayFill(8,0)};

// Line graph positions and colors
var lineGraphPos = []
for (let i=0; i<16; i++){
    let boxDist = graphHeight+graphSpacing;
    let x = Math.floor(i/4)*boxDist + graphSpacing*(1+Math.floor(i/8));
    let y = (i%4)*boxDist + graphSpacing;
    lineGraphPos.push([x,y])
}
var rgbStrings = ['10,30,200','200,1,20','20,150,100','0,200,0','200,150,8'];
const rgbIndex = i=>rgbStrings[i%rgbStrings.length];

// Flynn outline color
var rgbSole = '80,120,80';
var solesOffsetY = 380;

// Bump positions and colors
var bumpPos = [];
// for (let i=0; i<16; i++){
//     let dx = curveW + 20;
//     let dy = maxCurveH + 10;
//     let x = (i%4)*dx + 20;
//     let y = Math.floor(i/4)*dy + Math.floor(i/8)*45+dy;
//     bumpPos.push([x,y])
// }

// for (let i=0; i<8; i++){
//     let dx = curveW + 20;
//     let dy = maxCurveH + 10;
//     let x = (i%4)*dx + 20;
//     let y = Math.floor(i/4)*dy +dy;
//     bumpPos.push([x,y])
// }
bumpPos = [[20,90],[20,130],[190,95],[330,65],[350,120],[20,10],[180,10],[340,10]] // (8 values)
var bumpOrderR = [1,0,2,4,3,5,6,7]
var bumpR = bumpOrderR.map(d=>[bumpPos[d][0],solesOffsetY-bumpPos[d][1]])
bumpPos = bumpPos.concat(bumpR);

var rgbBump = '0,170,255'

// Circle connections and colors
var rgbDot = '200,0,0';
var rgbLine = '200,200,130';
var circleConnections = [[0,1],[1,2],[0,2],[2,3],[2,4],[3,4],[0,3]];
// var ccR = bumpOrderR.map(d=>[circleConnections[d].map(n=>(n+8)%16)])
var ccR = circleConnections.map(d=>d.map(n=>(bumpOrderR[n]+8)%16))
circleConnections = circleConnections.concat(ccR)

// Meter color
var rgbMeter = '220,50,18';
var rgbTotalMeter = '220,130,30'

// D3 SVG elements

// Line graph boxes
let $graphs = $svg.append('g')
    .attr('id','line-graphs')
    .selectAll('path')
    .data(arrayFill(16,0)).enter();

$graphs.append('rect')
    .attr('x',(d,i)=>lineGraphPos[i][0]-boxPad)
    .attr('y',(d,i)=>lineGraphPos[i][1]-boxPad)
    .attr('rx',3).attr('ry',3)
    .attr('width',graphHeight+2*boxPad)
    .attr('height',graphHeight+2*boxPad)
    .attr('stroke',(d,i)=>`rgba(${rgbIndex(i)},.5)`)
    .attr('fill',(d,i)=>`rgba(${rgbIndex(i)},.1)`)
    .attr('stroke-width', 2);

$graphs.append('path')
    .attr('id',(d,i)=>'line-graph'+i)
    .attr('d','')
    .attr('stroke',(d,i)=>`rgb(${rgbIndex(i)})`)
    .attr('stroke-width',2)
    .attr('fill','transparent');

// Shoe Sensor bumps
$svg.append('g').attr('id','sensor-bumps')
    .attr('transform','translate(400 50)');

// Shoe outlines
$svg.select('#sensor-bumps')
    .append('g').attr('id','shoe-soles')
    .append('path').attr('id','shoe-shape')
    .attr('d',"M 336.95 69.95 Q 337.3 85.6 321.05 98.45 306.85 109.6 288.6 112.95 273.25 115.85 254.35 113.7 237.15 111.7 223.2 106.5 206.95 100.45 183.3 97 164.15 94.3 150.45 94.4 123.4 94.7 104.25 99.5 75.05 106.8 53.5 107.2 23.65 107.8 11.85 94.95 2.5 84.8 2.6 73.9 2.7 63.85 10.75 54.4 18.35 45.45 31.65 38.7 44.95 32 60.85 28.95 76.55 26.05 127.1 17.75 153.6 13.45 188.85 7.75 211.15 4.15 234.65 3.3 268.7 2 286.45 7.95 309.85 15.9 322.75 31.05 336.4 47.1 336.95 69.95 Z")
    .attr('stroke',`rgba(${rgbSole},.6)`)
    // .attr('fill','rgba(50,200,40,.1)')
    .attr('stroke-width',2)
    .attr('transform','scale(1.4,1.4) rotate(3)')
    // .style('visibility','hidden') // Remove this line once sensors are arranged

$svg.select('#shoe-soles')
    .append('use').attr('href','#shoe-shape')
    .attr('transform',`scale(1,-1) translate(3,-${solesOffsetY})`)

// Bump gradients
var $curveGradient = $svg.append('defs').append('linearGradient')
    .attr('id', 'curveGradientRef')
    .call(attrs,'x1 y1 x2 y2',[0, 1, 0, 0]);

$curveGradient.append('stop')
    .attr('offset','0%')
    .attr('stop-color','black');
$curveGradient.append('stop')
    .attr('offset','100%')
    .attr('stop-color',`rgb(${rgbBump})`);

// Bump graphics
$svg.select('#sensor-bumps')
    .append('g').attr('id','bump-curves')
    .selectAll('path').data(arrayFill(16,0))
    .enter().append('path')
    .attr('stroke',`rgb(${rgbBump})`)
    .attr('stroke-width', 2)
    .attr('id',(d,i)=>'sensorBump'+i)
    .attr('fill',(d,i)=>`url(#curveGradientRef)`)

// Bump mesh-line gradients
var $lineGradient = $svg.append('defs').append('radialGradient')
    .attr('id', 'lineGradientRef');

$lineGradient.append('stop')
    .attr('offset','0%')
    .attr('stop-color',`rgba(${rgbLine},.2)`);
$lineGradient.append('stop')
    .attr('offset','100%')
    .attr('stop-color',`rgba(${rgbLine},.8)`);

$svg.append('defs').attr('id','line-gradients')
    .selectAll('radialGradient')
    .data(circleConnections)
    .enter().append('radialGradient')
    .html($lineGradient.html())
    .attr('id', d=>`lineGradient${d[0]}-${d[1]}`)
    .call(attrs,'cx cy fx vy r',arrayFill(5,.5))

// Bump mesh-lines
$svg.select('#sensor-bumps')
    .append('defs').attr('id','edges')
    .selectAll('path').data(circleConnections)
    .enter().append('mask').attr('id',d=>`lineMask${d[0]}-${d[1]}`)
    .append('path')
    .attr('stroke','white')
    .attr('stroke-width',2)
    .attr('d',d=>{
        let [x1,y1,h1] = curvePointH(d[0]);
        let [x2,y2,h2] = curvePointH(d[1]);
        return `M ${x1+curveW/2} ${y1-h1} L ${x2+curveW/2} ${y2-h2}`
    })

// Line gradient circles (masked by lines)
$svg.select('#sensor-bumps')
    .append('g').attr('id','lineFills')
    .selectAll('circle').data(circleConnections)
    .enter().append('circle')
    .attr('r',d=>arrayDist(bumpPos[d[0]],bumpPos[d[1]]))
    .attr('cx',d=>bumpPos[d[0]][0]+curveW/2)
    .attr('cy',d=>bumpPos[d[0]][1])
    .attr('fill',d=>`url(#lineGradient${d[0]}-${d[1]})`)
    .attr('mask',d=>`url(#lineMask${d[0]}-${d[1]})`)

// Bump points
$svg.select('#sensor-bumps')
    .append('g').attr('id','dots')
    .selectAll('circle').data(arrayFill(16,0))
    .enter().append('circle')
    .attr('fill',`rgb(${rgbDot})`).attr('r',dotRadius)
    .attr('cx',(d,i)=>bumpPos[i][0]+curveW/2)
    .attr('cy',(d,i)=>bumpPos[i][1]);

// Meters
$svg.append('g').attr('id','meters')
    .attr('transform','translate(50, 310)')
    .selectAll('rect').data([0,0])
    .enter().append('rect')
    .attr('x',(d,i)=>i*(meterW+meterSpacing))
    .attr('y',0)
    .attr('width',meterW)
    .attr('height',meterH)
    .attr('stroke',`rgba(${rgbMeter},.5)`)
    .attr('fill',`rgba(${rgbMeter},.15)`)
    .attr('stroke-width', 2);

d3.select('#meters').append('g')
    .attr('id','meter-levels')
    .selectAll('rect').data([0,0])
    .enter().append('rect')
    .attr('x',(d,i)=>i*(meterW+meterSpacing))
    .attr('y',meterH)
    .attr('width',meterW)
    .attr('fill',`rgba(${rgbMeter},.6)`)

d3.select('#meters').append('g')
    .attr('id','total-meter')
    .attr('transform',`translate(${2*meterW+3*meterSpacing} 0)`)
    .append('rect')
    .attr('width',meterW*1.5)
    .attr('height',meterH)
    .attr('stroke',`rgba(${rgbTotalMeter},.5)`)
    .attr('fill',`rgba(${rgbTotalMeter},.15)`)
    .attr('stroke-width', 2);

d3.select('#total-meter').append('rect')
    .attr('id','total-level')
    .attr('y',meterH)
    .attr('width',meterW*1.5)
    .attr('fill',`rgba(${rgbTotalMeter},.3)`)

function updateSensors(dt=200){
    var sensorArray = currentSamples.left.concat(currentSamples.right);

    // Transition sensor bumps
    d3.select('#bump-curves')
        .selectAll('path').data(sensorArray)
        .transition().duration(dt)
        .attr('sample-value',d=>d)
        .attr('d',(d,i)=>{
            let h = d*maxCurveH/maxSample;
            let [x,y] = bumpPos[i];
            let tx1 = curveW*tanW/2;
            let tx2 = curveW*(1-tanW)/2;
            return `M ${x} ${y} c ${tx1} 0, ${tx2} ${-h}, ${curveW/2} ${-h} s ${tx2} ${h}, ${curveW/2} ${h} M -10000 ${y-maxCurveH} l 1 0`}
        );

    // Transition sensor dots
    $svg.select('#dots')
        .selectAll('circle').data(sensorArray)
        .transition().duration(dt)
        .attr('cy',(d,i)=>bumpPosY(i))

    // Transition mesh-lines
    $svg.select('#edges')
        .selectAll('path').data(circleConnections)
        .transition().duration(dt)
        .attr('d',d=>{
            let [x1,y1,h1] = curvePointH(d[0]);
            let [x2,y2,h2] = curvePointH(d[1]);
    
            return `M ${x1+curveW/2} ${y1-h1} L ${x2+curveW/2} ${y2-h2}`
        })

    // Transition mesh-line gradient sizes
    $svg.select('#lineFills')
        .selectAll('circle').data(circleConnections)
        .transition().duration(dt)
        .attr('cy',d=>bumpPosY(d[0]))
        .attr('r', d=>arrayDist(
            [bumpPos [d[0]] [0], bumpPosY(d[0])],
            [bumpPos [d[1]] [0], bumpPosY(d[1])]
        ))

    // Transition mesh-line gradient stops
    for (let d of circleConnections){
        d3.select(`#lineGradient${d[0]}-${d[1]}`)
            .selectAll('stop').data(d)
            .transition().duration(dt)
            .attr('stop-color',id=>`rgba(${rgbLine},${sensorArray[id]/maxSample*.7+.2})`)
    }
    
    // Update line graphs
    d3.select('#line-graphs').selectAll('path')
        .attr('d',(d,i)=>{
            let lr = (i<8)?'left':'right';
            return lineString(...lineGraphPos[i], sensorHistory[lr], i%8);
        })
    
    // Update meters
    const leftTotal = currentSamples.left.reduce((a,b)=>(a+b),0);
    const rightTotal = currentSamples.right.reduce((a,b)=>(a+b),0);
    const grandTotal = leftTotal+rightTotal;
    const maxTotal = maxSample*8;

    d3.select('#meter-levels').selectAll('rect')
        .data([leftTotal,rightTotal])
        .transition().duration(dt)
        .attr('height', d=>d/maxTotal*meterH)
        .attr('y', d=>meterH*(1-d/maxTotal))

    d3.select('#total-level')
        .transition().duration(dt)
        .attr('height', grandTotal/maxTotal/2*meterH)
        .attr('y', meterH*(1-grandTotal/maxTotal/2))
    
    function bumpPosY(i){
        return bumpPos[i][1]-sensorArray[i]*maxCurveH/maxSample;
    }
}

function newSensorData(isLeft,samples){
    let t1 = Date.now()-t0;
    samples=samples.slice();
    samples.time = t1;

    let lr = isLeft?'left':'right';

    currentSamples[lr] = samples;
    sensorHistory[lr].splice(0,0,samples);
    if (sensorHistory[lr].length > maxHistory) sensorHistory[lr].pop();

    updateSensors(tDuration);
}

function lineString(x,y,sampleHistory,s=0){
    var str = '';
    const dy = graphHeight/maxSample;
    var totalTime = 0;
    for (let i=0; i<sampleHistory.length; i++){

        let oldX = totalTime*lineDxDt/1000;
        if (i>0) totalTime += sampleHistory[i-1].time - sampleHistory[i].time;
        let newX = totalTime*lineDxDt/1000;

        let p = sampleHistory[i][s];

        // Stop drawing if past edge of box
        if (newX > graphHeight && i) {
            let split = (graphHeight-oldX)/(newX-oldX)
            let p0 = sampleHistory[i-1][s]

            str += `L ${x+graphHeight} ${y+graphHeight-dy*lerp(p0,p,split)}`
            break;
        }

        str += i==0?'M ':'L ';
        str += `${x+newX} ${y+graphHeight-p*dy}`;
        // str += `${x+oldX} ${y+graphHeight-p*dy} l ${newX-oldX} 0`
    }
    return str;
}

function curvePointH(i){
    let lr = i<8?'left':'right';
    let d = currentSamples[lr][i%8];

    let h = d*maxCurveH/maxSample;
    let [x,y] = bumpPos[i]
    return [x,y,h];
}

updateSensors(0);

// Array etc. helper functions

function arrayFill(n, value, clone=true){
    if (typeof value != "object") clone=false;
    return ([...Array(n)]).map(d=>clone?Object.clone(value):value);
}

function lerp(a,b,t){
    return a+t*(b-a);
}

function arraySum(a1, a2){
    return a1.map((d,i)=>d+a2[i])
}

function arrayDist(a1,a2){
    return Math.hypot(...arraySum(a1,a2.map(d=>-d)));
}

function attrs($obj, keys, values){
    if (typeof keys == 'string') keys = keys.split(' ');

    for (let i=0; i<keys.length; i++){
        $obj.attr(keys[i],values[i])
    }
}