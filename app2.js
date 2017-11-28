require('./src/logger')()
var url = require('url');
var WebSocket = require('ws');
var HttpsProxyAgent = require('https-proxy-agent'); // https://github.com/TooTallNate/node-https-proxy-agent

// HTTP/HTTPS proxy to connect to
var proxy = process.env.http_proxy || undefined // none
var socket = null
console.log(proxy)

// WebSocket endpoint for the proxy to connect to
var endpoint = 'ws://localhost:3000/socket.io/?EIO=3&transport=websocket';

if (proxy != undefined) {
  console.log('using proxy server %j', proxy);

  var parsed = url.parse(endpoint);
  console.log('attempting to connect to WebSocket %j', endpoint);

  // create an instance of the `HttpsProxyAgent` class with the proxy server information
  var options = url.parse(proxy);

  var agent = new HttpsProxyAgent(options);
  socket = new WebSocket(endpoint, { 
    agent: agent,
    perMessageDeflate: false
  });
} else {
  // No proxy
  socket = new WebSocket(endpoint, {
    perMessageDeflate: false
  });
}

// finally, initiate the WebSocket connection
// var socket = new WebSocket(endpoint, { agent: agent }); // TODO uncomment to use a proxy. Now, skipping
var socketMessageInnerType = []
socketMessageInnerType[0] = "CONNECT"
socketMessageInnerType[1] = "DISCONNECT"
socketMessageInnerType[2] = "EVENT"
socketMessageInnerType[3] = "ACK"
socketMessageInnerType[4] = "ERROR"
socketMessageInnerType[5] = "BINARY_EVENT"
socketMessageInnerType[6] = "BINARY_ACK"

var pingInterval = null
var pingTimeout = null
var id = null
socket.on('open', function () {
  console.log('"Socket Open"');
  socket.send('42["testing", {"key1": "value1"}');
});

socket.on('error', function (data) {
  console.log('"err" event!');
});

socket.on('message', function (data) {
  var packetType = parseInt(data.substr(0, 1))
  // packetType = 0:handshake, 1:?, 2:Ping, 3:Pong, 4:Events
  if (packetType === 0) { // Handshake (https://github.com/socketio/engine.io-client/blob/4558b25922e19efd52f9b80e50c315f694f2a4e8/engine.io.js)
    var messageData = JSON.parse(data.substr(1))
    
    pingInterval = messageData.pingInterval
    pingTimeout = messageData.pingTimeout
    id = messageData.sid

    // Handshake
    socket.emit('handshake', data);
    console.debug(JSON.stringify(messageData))
  } else if (packetType === 3) {
    console.debug('Pong!')
  } else {
    var eventInnerType = socketMessageInnerType[parseInt(data.substr(1, 1))]
    switch (eventInnerType) {
      case "ACK":
        console.log('Ack? What should I do')
        break;
      case "ERROR":
        console.log('Error? What should I do')
        break;
      case "BINARY_EVENT":
        console.log('BINARY_EVENT? What should I do')
        break;
      case "BINARY_ACK":
        console.log('BINARY_ACK? What should I do')
        break;
      case "Connected":
        console.log('Connected')
        break;
      case "DISCONNECT":
        console.log('Disconnected')
        break;
      case "EVENT":
        eventData = JSON.parse(data.substr(2))
        var eventName = eventData[0]
        var eventParam = eventData[1]

        console.debug(`${packetType} - ${eventInnerType} > ${eventName} // ${eventParam}`)
        break;
      default:
        console.debug(`${packetType} - ${eventInnerType} > ${data.substr(2)}`)
    }
  }
});

function sendMsg(channel, data) {
  socket.send(42 + JSON.stringify([channel, data]))
}

// Heartbeat
setInterval(function(){ sendHeartbeat(); }, 5000);
function sendHeartbeat() {
  console.debug('Ping!')
  socket.send("2"); // Send ping
  sendMsg('testing', {a: "b"})
}

