require('dotenv').config()
require('./src/logger')()

var thinIoClient = require('./src/thinWS-Socket-IO-client')

var proxy = process.env.http_proxy || undefined // none if outside of corporate proxy (let's say)

// WebSocket endpoint for the proxy to connect to
var endpoint = 'ws://localhost:3000/socket.io/?EIO=3&transport=websocket'

var socket = thinIoClient.connect(endpoint, {})

socket.on('time', (data) => {
  console.log(data) // Display the time.
})
