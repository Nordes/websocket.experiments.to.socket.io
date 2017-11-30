# Super thin Socket-IO client
Simple proof of concept that connects to `Socket.IO` server using `WebSocket` (WS library). The reason why I did this is because I was not able to find something that was working behind a corporate proxy. Socket-IO is hard to _hack_ in order to add my proxy. So after hours of research on _if it was possible_, I found an article that said it was. Basically, Socket.IO does not take into account the proxy settings regarding the first HTTP request. Because of that, we cannot have Socket.IO client behind the firewall/proxy. Probably someone did something somewhere, but I haven't found it in order to make it work in my current case. 


I actually solve the issue by using the `https-proxy-agent`. It gives the opportunity to initialize a WebSocket (WS library) with a proxy.

# In somewhat the todo's
* Multiplexing. Now we only connect to one WS endpoint and it's kind of ok.
* When doing a full reconnection when connection cut will loose it's data. Socket-io keeps a queue until it reconnects.
* Probably many other things since I don't have the binary data, ACK and a few other things.

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
