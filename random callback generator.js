var dtMin = 80, dtMax = 400;
// dtMin = 1000; dtMax = 1100;
var t0 = Date.now();
var t1;

var generating = true;

function stop(){
    generating = false;
}

function randomGenerate(){
    if (!generating) return;
    
    let sensorArray = []
    for (let i=0; i<8; i++){
        sensorArray.push(Math.random()*100);
    }
    let isLeft = Math.random()>.5;
    newSensorData(isLeft,sensorArray);

    setTimeout(randomGenerate, Math.random()*(dtMax-dtMin)+dtMin);
}

// function newSensorData(isLeft,samples){
//     t1=Date.now()
//     console.log(t1-t0);
//     console.log(isLeft?'left':'right',samples);
//     t0=t1;
// }

setTimeout(randomGenerate, 10);