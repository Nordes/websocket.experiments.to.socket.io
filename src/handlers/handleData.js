var types = require('../types')

var handle = (data, socket) => {
  switch (parseInt(data.substr(1, 1))) {
    // To complete, see doc at https://github.com/socketio/socket.io-protocol
    case types.messageInnerType.Ack:
      console.log('[SocketClient] Ack? What should I do')
      break
    case types.messageInnerType.Error:
      console.log('[SocketClient] Error? What should I do')
      break
    case types.messageInnerType.BinaryEvent:
      console.log('[SocketClient] BINARY_EVENT? What should I do')
      break
    case types.messageInnerType.BinaryAck:
      console.log('[SocketClient] BINARY_ACK? What should I do')
      break
    case types.messageInnerType.Connect:
      console.log('[SocketClient] Connected')
      break
    case types.messageInnerType.Disconnect:
      console.log('[SocketClient] Disconnected')
      break
    case types.messageInnerType.Event:
      var eventData = JSON.parse(data.substr(2))
      var eventName = eventData[0]
      var eventParam = eventData[1]

      console.debug(`[SocketClient] ${data.substr(0, 1)} - ${data.substr(1, 1)} > "${eventName}" Data > ${eventParam}`)
      socket.emit(eventName, eventParam)
      break
    default:
      console.debug(`[SocketClient] ${data.substr(0, 1)} - ${data.substr(1, 1)} > ${data.substr(2)}`)
  }
}

module.exports.handle = handle
