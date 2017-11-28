# yes, something
Really tiny and simple proof of concept that connects to Socket.IO server using WebSocket. I had to do this after seeing I was behind a corporate firewall. Socket.IO bypass the proxy settings for the first request and because of that we cannot have Socket.IO client behind the firewall/proxy. To solve the issue I use the `https-proxy-agent` that gives the opportunity to initialize a WebSocket with a proxy.

In my case, I wrote this code only to see how I could integrate with a Socket.IO server.

# Life saver ;)
* Explain the basics https://stackoverflow.com/questions/35673673/use-socket-io-with-servlet and https://github.com/socketio/engine.io-client/blob/4558b25922e19efd52f9b80e50c315f694f2a4e8/engine.io.js
  * https://github.com/socketio/socket.io-protocol

# To run...
```
npm install
```

## Server (Socket.IO)
Deploy OR run the server on something like Heroku (Give http/s, ws/s without any fee(s)).
```
node app1
```

## Client (Pure WebSocket)
Set your environment configuration to use your proxy. (`process.env.http_proxy`)
```
node app2
```
