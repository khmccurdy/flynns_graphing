const isOldPrototype = false;

const FLYNNS_LEFT = {
    serviceUUID : (isOldPrototype)? "0000ffe0-0000-1000-8000-00805f9b34fb" : "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
    characteristicUUID : (isOldPrototype)? "0000ffe1-0000-1000-8000-00805f9b34fb" : "beb5483e-36e1-4688-b7f5-ea07361b26a8",
}
const FLYNNS_RIGHT = {
    serviceUUID : (isOldPrototype)? "0000ffa0-0000-1000-8000-00805f9b34fb" : "7a658cba-0dcd-4d02-bb97-80296cf72dfd",
    characteristicUUID : (isOldPrototype)? "0000ffb0-0000-1000-8000-00805f9b34fb" : "beb5483e-36e1-4688-b7f5-ea07361b26a8",
}

const flynns = {
    left : {
        isConnected : false,
        samples : [],
    },
    right : {
        isConnected : false,
        samples : [],
    },
    callbacks : [],
}
/*
const connectLeftButton = document.createElement("button");
    connectLeftButton.innerText = "Connect Left";
    connectLeftButton.addEventListener("click", event => {
        connect(true);
    })
document.body.appendChild(connectLeftButton);

const connectRightButton = document.createElement("button");
    connectRightButton.innerText = "Connect Right";
    connectRightButton.addEventListener("click", event => {
        connect(false);
    })
document.body.appendChild(connectRightButton);
*/
function connect(isLeft = true) {
    if(flynns[isLeft? "left" : "right"].isConnected) return;

    const {serviceUUID, characteristicUUID} = isLeft? FLYNNS_LEFT : FLYNNS_RIGHT;
    navigator.bluetooth.requestDevice({
        filters : [
            {services : [serviceUUID]},
        ]
    })
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService(serviceUUID))
    .then(service => service.getCharacteristic(characteristicUUID))
    .then(characteristic => {
        flynns[(isLeft? "left":"right")].isConnected = true;
        // const button = isLeft?
        //     connectLeftButton :
        //     connectRightButton;
        // document.body.removeChild(button);

        characteristic.startNotifications()
        .then(characteristic => characteristic.addEventListener("characteristicvaluechanged", (event) => {
            const value = event.target.value;
            const buffer = value.buffer;
            const samplesRaw = new Uint8Array(buffer);
    
            var decoder = new TextDecoder("utf-8");
            const samplesString = decoder.decode(samplesRaw);
            const samplesStrings = samplesString.split(',');
            const _samples = samplesStrings.map(sampleString => Number(sampleString));
    
            const {samples} = isLeft? flynns.left : flynns.right;
            _samples.forEach((sample, sampleIndex) => samples[sampleIndex] = sample);
    
            flynns.callbacks.forEach(callback => callback(isLeft, flynns[isLeft? "left":"right"].samples));
        }))

        // New: Update svg button color
        connectSuccess(isLeft? "left":"right");
    })
}