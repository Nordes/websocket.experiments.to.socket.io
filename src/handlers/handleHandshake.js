var types = require('../types')

var pingInterval = null
var heartbeatInterval = null
// var pingTimeout = null
// var id = null

var handle = (data, socket) => {
  // Handshake (https://github.com/socketio/engine.io-client/blob/4558b25922e19efd52f9b80e50c315f694f2a4e8/engine.io.js)
  var messageData = JSON.parse(data.substr(1))

  pingInterval = messageData.pingInterval
  // pingTimeout = messageData.pingTimeout
  // id = messageData.sid
  startPingPongGame(socket)
  // Handshake
  // socket.send('handshake', data); // We should be sending... but let's say we're cool without it.
  console.debug(`[SocketClient] ` + JSON.stringify(messageData))
}

var stopHeartbeat = () => {
  clearInterval(heartbeatInterval)
}

// Heartbeat
function startPingPongGame (socket) {
  heartbeatInterval = setInterval(() => sendHeartbeat(), pingInterval)

  function sendHeartbeat () {
    console.debug('[SocketClient] Ping (o.O)')
    try {
      socket.send(types.packetType.Ping.toString()) // Send ping
    } catch (e) {
      socket.emit('error', e)
    }
  }
}

module.exports.handle = handle
module.exports.stopHeartbeat = stopHeartbeat
