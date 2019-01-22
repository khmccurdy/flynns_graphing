var sensorRecording;
var recordT0;
var playbackTimeouts = [];

function flynnsRecord(){
    recordT0 = Date.now();
    if (!(flynns.left.isConnected || flynns.right.isConnected)) {
        console.warn('Flynns are not connected. Recording will start automatically once Flynns are detected.');
    }
    if (flynns.callbacks.indexOf(recordSensorData)>=0) {
        console.warn('Recording already in progress.');
        return;
    }
    sensorRecording = {left:[],right:[]};
    flynns.callbacks.push(recordSensorData);
}

function flynnsStopRecord(){
    const indexOfCallback = flynns.callbacks.indexOf(recordSensorData);
    if (indexOfCallback < 0) return;
    flynns.callbacks.splice(indexOfCallback, 1);
}

function recordSensorData(isLeft,samples){
    let t1 = Date.now()-recordT0;
    samples=samples.slice();
    samples.time = t1;

    let lr = isLeft?'left':'right';

    sensorRecording[lr].push(samples);
    // if (sensorHistory[lr].length > maxHistory) sensorHistory[lr].pop();
}

function flynnsReplay(rec=sensorRecording){
    let ptoL, ptoR;
    generating = false;
    flynnsStopReplay();
    let t0= Date.now();
    for (let lr in rec){
        for (let sa of rec[lr]){
            ptoL = setTimeout(()=>newSensorData(lr=='left',sa),sa.time)
            playbackTimeouts.push(ptoL);
        }
    }
    // For longer recordings, timing may drift by a few milliseconds - around 1 ms per 100 samples on my machine
    // console.log(Date.now()-t0) 
    // console.log(playbackTimeouts.length)
}

function flynnsStopReplay(){
    for (let t of playbackTimeouts){
        clearTimeout(t);
    }
    playbackTimeouts=[];
}