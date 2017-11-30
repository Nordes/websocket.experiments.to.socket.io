require('./src/logger')()
var thinIoClient = require('./src/thinWS-Socket-IO-client')
// HTTP/HTTPS proxy to connect to
var proxy = process.env.http_proxy || undefined // none
var socket = null
console.log(proxy)

// WebSocket endpoint for the proxy to connect to
var endpoint = 'ws://localhost:3000/socket.io/?EIO=3&transport=websocket';

function send(channel, data) {
  // DATA(4)+EVENT(2)
  socket.send(42 + JSON.stringify([channel, data]))
}

thinIoClient.connect(endpoint, {})
