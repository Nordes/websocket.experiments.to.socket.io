# yes, something
Connection from WebSocket to Socket.IO

I basically want to bypass the corporate proxy using `https-proxy-agent` with a simple WebSocket (this works). Socket.IO cannot work behind a corporate proxy and it is not cool :(.

# Life saver ;)
* Explain the basics https://stackoverflow.com/questions/35673673/use-socket-io-with-servlet and https://github.com/socketio/engine.io-client/blob/4558b25922e19efd52f9b80e50c315f694f2a4e8/engine.io.js
  * https://github.com/socketio/socket.io-protocol

# To run...
## Server (Socket.IO)
```
node app1
```

## Client (Pure WebSocket)
```
node app2
```
