var url = require('url');
var WebSocket = require('ws');
var HttpsProxyAgent = require('https-proxy-agent'); // https://github.com/TooTallNate/node-https-proxy-agent

var socketMessageInnerType = []
socketMessageInnerType[0] = "CONNECT"
socketMessageInnerType[1] = "DISCONNECT"
socketMessageInnerType[2] = "EVENT"
socketMessageInnerType[3] = "ACK"
socketMessageInnerType[4] = "ERROR"
socketMessageInnerType[5] = "BINARY_EVENT"
socketMessageInnerType[6] = "BINARY_ACK"
var autoReconnectInterval = 5 * 1000 // 5 seconds?
var heartbeatInterval = null
var origUrl = null
var origOpt = null

function startSocket (wsUri, opt) {
  // WebSocket endpoint for the proxy to connect to
  if (opt.proxy != undefined) {
    console.log(`[SocketClient] using proxy server ${opt.proxy}`);

    var parsed = url.parse(wsUri);
    console.log(`[SocketClient] Attempting to connect to WebSocket ${wsUri}`);

    // create an instance of the `HttpsProxyAgent` class with the proxy server information
    var options = url.parse(opt.proxy);

    var agent = new HttpsProxyAgent(options);
    socket = new WebSocket(wsUri, { 
      agent: agent,
      perMessageDeflate: false
    });
  } else {
    // No proxy
    socket = new WebSocket(wsUri, {
      perMessageDeflate: false
    });
  }

  return socket;
}

var connect = (wsUri, opts) => {
  if (!wsUri) {
    throw new Error('[SocketClient] When initializing the Socket we need an URI (i.e.: ws://www.sample.com/socket.io/?EIO=3&transport=websocket')
  }
  origUrl = wsUri
  origOpt = opts
  var opt = Object.assign({ proxy: undefined }, opts)
  var socket = startSocket(wsUri, opt)

  var pingInterval = null
  var pingTimeout = null
  var id = null
  
  socket.on('close', (e) => {
    switch (e) {
      case 1000:	// CLOSE_NORMAL
        console.log("WebSocket: closed");
      break;
      default:	// Abnormal closure
        clearInterval(heartbeatInterval)
        reconnect(e);
      break;
    }
    // this.onclose(e);
  })
  socket.on('open', function () {
    // console.log('"Socket Open"');
    socket.emit('connect')
  });

  socket.on('error', function (data) {
    console.log('[SocketClient] "err" event!');
    console.log(data)
    switch (data.code){
      case 'ECONNREFUSED':
        reconnect(data)
        break;
    }
  });

  socket.on('message', function (data) {
    var packetType = parseInt(data.substr(0, 1))
    // packetType = 0:handshake, 1:?, 2:Ping, 3:Pong, 4:Events
    if (packetType === 0) { // Handshake (https://github.com/socketio/engine.io-client/blob/4558b25922e19efd52f9b80e50c315f694f2a4e8/engine.io.js)
      var messageData = JSON.parse(data.substr(1))
      
      pingInterval = messageData.pingInterval
      pingTimeout = messageData.pingTimeout
      id = messageData.sid
      startPingPongGame()
      // Handshake
      // socket.send('handshake', data); // We should be sending... but let's say we're cool without it.
      console.debug(`[SocketClient] ` + JSON.stringify(messageData))
    } else if (packetType === 3) {
      console.debug('[SocketClient] Pong (-.O)')
    } else {
      var eventInnerType = socketMessageInnerType[parseInt(data.substr(1, 1))]
      switch (eventInnerType) {
        // To complete, see doc at https://github.com/socketio/socket.io-protocol
        case "ACK":
          console.log('[SocketClient] Ack? What should I do')
          break;
        case "ERROR":
          console.log('[SocketClient] Error? What should I do')
          break;
        case "BINARY_EVENT":
          console.log('[SocketClient] BINARY_EVENT? What should I do')
          break;
        case "BINARY_ACK":
          console.log('[SocketClient] BINARY_ACK? What should I do')
          break;
        case "Connected":
          console.log('[SocketClient] Connected')
          break;
        case "DISCONNECT":
          console.log('[SocketClient] Disconnected')
          break;
        case "EVENT":
          eventData = JSON.parse(data.substr(2))
          var eventName = eventData[0]
          var eventParam = eventData[1]

          console.debug(`[SocketClient] ${packetType} - ${eventInnerType} > "${eventName}" Data > ${eventParam}`)
          socket.emit(eventName, eventParam)
          break;
        default:
          console.debug(`[SocketClient] ${packetType} - ${eventInnerType} > ${data.substr(2)}`)
      }
    }
  });

  function send(channel, data) {
    // DATA(4)+EVENT(2)
    socket.send(42 + JSON.stringify([channel, data]))
  }

  // Heartbeat
  function startPingPongGame() {
    heartbeatInterval = setInterval(function(){ sendHeartbeat(); }, 3000)// pingInterval);

    function sendHeartbeat() {
      console.debug('[SocketClient] Ping (o.O)')
      try {
        socket.send("2"); // Send ping
      } catch (e) {
        socket.emit('error', e)
      }
      // Should restart if it fails (exception.. after X minutes)
    }
  }

  socket.emit2 = send
  return socket
}

// Idea from => https://github.com/websockets/ws/wiki/Websocket-client-implementation-for-auto-reconnect
var reconnect = (e) => {
	console.log(`WebSocketClient: retry in ${autoReconnectInterval}ms`,e);
  socket.removeAllListeners();
	setTimeout(function(){
		console.log("WebSocketClient: reconnecting...");
		connect(origUrl, origOpt)
	}, autoReconnectInterval);
}

module.exports.connect = connect;
