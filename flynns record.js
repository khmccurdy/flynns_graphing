var sensorRecording;
var sensorRecordingsNamed={};
var recordT0;
var playbackTimeouts = [];
var currentRecordName = '';

function flynnsRecord(name=''){
    recordT0 = Date.now();
    if (!(flynns.left.isConnected || flynns.right.isConnected)) {
        console.warn('Flynns are not connected. Recording will start automatically once Flynns are detected.');
    }
    if (flynns.callbacks.indexOf(recordSensorData)>=0) {
        console.warn('Recording already in progress.');
        if (currentRecordName) console.warn(`'${currentRecordName}' will continue.`)
        return;
    }
    flynnsStopReplay();
    currentRecordName = name;
    if (name) {
        sensorRecordingsNamed[name] = {left:[],right:[]}
    } else{
        sensorRecording = {left:[],right:[]};
    }
    flynns.callbacks.push(recordSensorData);
}

function flynnsStopRecord(){
    currentRecordName = '';
    flynnsClearCallback(recordSensorData);
}

function recordSensorData(isLeft,samples){
    let t1 = Date.now()-recordT0;
    let name = currentRecordName;
    samples=samples.slice();
    samples.time = t1;

    let lr = isLeft?'left':'right';
    if (name) {
        sensorRecordingsNamed[name][lr].push(samples);
    } else{
        sensorRecording[lr].push(samples);
    }
    // if (sensorHistory[lr].length > maxHistory) sensorHistory[lr].pop();
}

function flynnsReplay(r=sensorRecording){
    let t0 = Date.now();
    if (r==undefined) return console.warn('Parameter is uninitialized');
    let ptoL, ptoR, rec;
    flynnsStopRecord();
    flynnsStopReplay();

    if (typeof r != 'object'){
        if (r === '') rec = sensorRecording;
        else rec = sensorRecordingsNamed[r];
    } else {
        rec = r;
    }
    if (rec==undefined) return console.warn('Record object is uninitialized');

    flynnsClearCallback(newSensorData);
    generating = false;

    for (let lr of ['left','right']){
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
    flynnsAddCallback(newSensorData);
}

function flynnsClearCallback(callback){
    const indexOfCallback = flynns.callbacks.indexOf(callback);
    if (indexOfCallback < 0) return;
    flynns.callbacks.splice(indexOfCallback, 1);
}

function flynnsAddCallback(callback){
    const indexOfCallback = flynns.callbacks.indexOf(callback);
    if (indexOfCallback < 0) flynns.callbacks.push(callback);
}