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

// Bump positions and colors
var bumpPos = [];
for (let i=0; i<16; i++){
    let dx = curveW + 20;
    let dy = maxCurveH + 10;
    let x = (i%4)*dx + 20;
    let y = Math.floor(i/4)*dy + Math.floor(i/8)*45+dy;
    bumpPos.push([x,y])
}
var rgbBump = '0,170,255'

// Circle connections and colors
var rgbDot = '200,0,0';
var rgbLine = '200,200,150';
var circleConnections = [[0,1],[0,4],[1,4],[1,5],[4,5],[3,6],[5,6],[8,10]]

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

// Bump gradients
var $curveGradient = $svg.append('defs').append('linearGradient')
    .attr('id', 'curveGradientRef');

$curveGradient.append('stop')
    .attr('offset','0%')
    .attr('stop-color','black');
$curveGradient.append('stop')
    .attr('offset','100%')
    .attr('stop-color',`rgb(${rgbBump})`);

$svg.append('defs').attr('id','bump-gradients')
    .selectAll('linearGradient')
    .data(arrayFill(16,0))
    .enter().append('linearGradient')
    .html($curveGradient.html())
    .attr('id', (d,i)=>'curveGradient'+i)
    .attr('x1',0).attr('x2',0)
    .attr('y1',1).attr('y2',0)

// Bump graphics
$svg.append('g').attr('id','sensor-bumps')
    .attr('transform','translate(400 50)')
    .selectAll('path').data(arrayFill(16,0))
    .enter().append('path')
    .attr('stroke',`rgb(${rgbBump})`)
    .attr('stroke-width', 2)
    .attr('id',(d,i)=>'sensorBump'+i)
    .attr('fill',(d,i)=>`url(#curveGradient${i})`)

// Bump points
$svg.select('#sensor-bumps')
    .append('g').attr('id','edges')
    .selectAll('path').data(circleConnections)
    .enter().append('path')
    .attr('stroke',`rgba(${rgbLine},.8)`)
    .attr('stroke-width',2)
    .attr('d',d=>{
        let [x1,y1,h1] = curvePointH(d[0]);
        let [x2,y2,h2] = curvePointH(d[1]);

        return `M ${x1+curveW/2} ${y1-h1} L ${x2+curveW/2} ${y2-h2}`
    })

$svg.select('#sensor-bumps')
    .append('g').attr('id','dots')
    .selectAll('circle').data(arrayFill(16,0))
    .enter().append('circle')
    .attr('fill',`rgb(${rgbDot})`).attr('r',dotRadius)
    .attr('cx',(d,i)=>bumpPos[i][0]+curveW/2)
    .attr('cy',(d,i)=>bumpPos[i][1]);

function updateSensors(dt=200){
    var sensorArray = currentSamples.left.concat(currentSamples.right);

    // Transition sensor bumps
    // Gradients are updated in a separate function
    d3.select('#sensor-bumps')
        .selectAll('path').data(sensorArray)
        .transition().duration(dt)
        .attr('sample-value',d=>d)
        .attr('d',(d,i)=>{
            let h = d*maxCurveH/maxSample;
            let [x,y] = bumpPos[i];
            let tx1 = curveW*tanW/2;
            let tx2 = curveW*(1-tanW)/2;
            return `M ${x} ${y} c ${tx1} 0, ${tx2} ${-h}, ${curveW/2} ${-h} s ${tx2} ${h}, ${curveW/2} ${h}`}
        );
    
    $svg.select('#sensor-bumps')
        .selectAll('circle').data(sensorArray)
        .transition().duration(dt)
        .attr('cy',(d,i)=>bumpPos[i][1]-d*maxCurveH/maxSample);

    $svg.select('#edges')
        .selectAll('path').data(circleConnections)
        .transition().duration(dt)
        .attr('d',d=>{
            let [x1,y1,h1] = curvePointH(d[0]);
            let [x2,y2,h2] = curvePointH(d[1]);
    
            return `M ${x1+curveW/2} ${y1-h1} L ${x2+curveW/2} ${y2-h2}`
        })
    
    // Update line graphs
    d3.select('#line-graphs').selectAll('path')
        .attr('d',(d,i)=>{
            let lr = (i<8)?'left':'right';
            return lineString(...lineGraphPos[i], sensorHistory[lr], i%8);
        })
}

function newSensorData(isLeft,samples){
    let t1 = Date.now()-t0;
    samples.time = t1;

    let lr = isLeft?'left':'right';

    currentSamples[lr] = samples;
    sensorHistory[lr].splice(0,0,samples);
    if (sensorHistory[lr].length > maxHistory) sensorHistory[lr].pop();

    updateSensors(tDuration);
}

// Animate gradients in sync with bumps
function updateGradients(){
    for (let i=0;i<16;i++){
        let d = d3.select('#sensorBump'+i).attr('sample-value');
        d3.select('#curveGradient'+i)
            .attr('gradientTransform',
            `scale(1 ${d>0?maxSample/d:1}) translate(0 ${-1+d/maxSample})`);
    }
}
setInterval(updateGradients,10);

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
        str += `${x+newX} ${y+graphHeight-p*dy} `;
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

updateSensors();

// Array functions

function arrayFill(n, value, clone=true){
    if (typeof value != "object") clone=false;
    return ([...Array(n)]).map(d=>clone?Object.clone(value):value);
}

function lerp(a,b,t){
    return a+t*(b-a);
}
