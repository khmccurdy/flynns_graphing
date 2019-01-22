try {
    connect(1);
    connect(0);
} catch (error) {
    console.warn(error);
}

flynns.callbacks.push(newSensorData);

var verifyInterval = 0;
function verifyConnection(){
    if (flynns.left.isConnected || flynns.right.isConnected) {
        tDuration=80;
        clearTimeout(verifyInterval)
        generating=false;
    }
}

verifyConnection();
verifyInterval = setInterval(verifyConnection,500);