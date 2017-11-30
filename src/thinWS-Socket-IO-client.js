var url = require('url');
var WebSocket = require('ws');
var HttpsProxyAgent = require('https-proxy-agent'); // https://github.com/TooTallNate/node-https-proxy-agent
var types = require('./types')
var handlers = require('./handlers')

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
    socket = new WebSocket(wsUri, { agent: agent, perMessageDeflate: false });
  } else {
    // No proxy
    socket = new WebSocket(wsUri, { perMessageDeflate: false });
  }

  return socket;
}

var connect = (wsUri, opts) => {
  if (!wsUri) throw new Error('[SocketClient] When initializing the Socket we need an URI (i.e.: ws://www.sample.com/socket.io/?EIO=3&transport=websocket')

  origUrl = wsUri
  origOpt = opts
  var opt = Object.assign({ proxy: undefined }, opts)
  var socket = startSocket(wsUri, opt)
  
  socket.on('close', (e) => {
    switch (e) {
      case 1000:	// CLOSE_NORMAL
        console.log("WebSocket: closed");
      break;
      default:	// Abnormal closure
        handlers.handshake.stopHeartbeat()
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
    switch (packetType) {
      case types.packetType.Handshake:
        handlers.handshake.handle(data, socket)
        break;
      case types.packetType.Pong:
        handlers.pong.handle()
        break;
      case types.packetType.Data:
        handlers.data.handle(data, socket)
        break;
      case types.packetType.Unknown:
      default:
        console.debug('An another type of event ;). Need debug.')
    }
  });

  function send(channel, data) {
    // DATA(4)+EVENT(2) <= Normally what we send
    socket.send(`${types.packetType.Data}${types.messageInnerType.Event}` + JSON.stringify([channel, data]))
  }

  socket.emitIO = send
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
