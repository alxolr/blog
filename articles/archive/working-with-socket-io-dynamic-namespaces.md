<img class="img-fluid" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/working-with-socket-io-dynamic-namespaces.jpg" alt="Working with socket.io dynamic namespaces"/>

## Summary

- [Problem](#problem)
- [Solution](#solution)

> Dynamic namespaces in socket.io are not possible at the moment but I was given the task to build a chat which is working for different namespaces.

As any programmer I started to dig on the net how to build dynamic namespaces with socket.io, by reading the documentation I found that they do not support yet this feature.

Found an answer at [Dynamic namespaces socket.io](https://stackoverflow.com/questions/13143945/dynamic-namespaces-socket-io) on stackoverflow, and I thought I need something in this manner.

## Problem

> In order to have a dynamic namespace there is needed a first peer to subscribe to the namespace.

In other words the first user who will connect will create the namespace, and after the users can just connect to existing one.

## Solution

I ll present my solution for the backend part and frontend part.
The backend will contain 2 files:

```bash
backend/
 - server.js
 - io-handler.js
```

### io-handler.js

```javascript

// io-handler.js

const { EventEmitter } = require('events');
const url = require('url');

const eventEmitter = new EventEmitter();
const namespacesCreated = {};

const routes = {
  chat: /category\/(\d+)\/item\/(\d+)\/chat/,
};

const ee = new EventEmitter();
const namespacesCreated = {}; // will store the existing namespaces

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    const { ns } = url.parse(socket.handshake.url, true).query;
    let matched = false;

    if (!ns) { // if there is not a ns in query disconnect the socket
      socket.disconnect();
      return { err: 'ns not provided' };
    }

    Object.keys(routes).forEach((name) => {
      const matches = ns.match(routes[name]);

      if (matches) {
        matched = true;
        if (!namespacesCreated[ns]) { // check if the namespace was already created
          namespacesCreated[ns] = true;
          io.of(ns).on('connection', (nsp) => {
            const evt = `dynamic.group.${name}`; // emit an event four our group of namespaces
            ee.emit(evt, nsp, ...matches.slice(1, matches.length));
          });
        }
      }
    });

    if (!matched) { // if there was no match disconnect the socket
      socket.disconnect();
    }
  });

  return ee; // we can return the EventEmitter to be used in our server.js file
};

ee.on('dynamic.group.chat', (socket, categoryId, itemId) => {
  // implement your chat logic
});
```

### server.js

Now let's build an express server with our `ioHandler`

```javascript
// server.js
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

//  we will load the io-handler module and will attach the connection listeners
require('./io-handler')(io);

server.listen(80);
```

### frontend integration

```javascript
import io from 'socket.io-client';

const namespace = '/category/1/item/2/chat'

const socket = io.connect(`${serverIoUrl}/${namespace}`, {
  query: `ns=${namespace}`,
  resource: 'socket.io'
});

socket.on('topic', () => {
  // implement your client side logic
});
```

In conclusion we managed to extend the socket.io to use dynamic namespaces.
