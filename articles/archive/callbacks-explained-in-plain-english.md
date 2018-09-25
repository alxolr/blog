<img class="img-fluid" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/callbacks-explained-in-plain-english.jpg" alt="Callbacks explained in plain english"/>

> _Callbacks_ - the building blocks of node.js programming. Not so easy to understand and a bit challenging to master.

## Summary

- [Basics](#basics)

## Basics

We will start with the following code snippet:

```javascript
const dns = require('dns');

dns.lookup('alxolr.com', (err, address, family) => {
  console.log('address: %j family: IPv%s', address, family);
});

// address: "188.166.92.146" family: IPv4
```

The snippet resolves a hostname (e.g. 'alxolr.com') into the first found `A` (IPv4) or `AAAA` (IPv6) record. in our case it has found the `IPv4` address.

> Do we have there a callback ?

The callback is the following function _(arrow function)_.

```javascript
(err, address, family) => {
  console.log('address: %j family: IPv%s', address, family);
}
```

which uses the `es6` syntax a more common way `es5` style to write it was

```javascript
function lookup(err, address, family) {
  console.log('address: %j family: IPv%s', address, family);
}
```

Then the simplest definition of a callback can be.
> **A _Callback_ is a function that is given as parameter to an other function which will get us the result in the parameters**

Let's try to simulate the implementation of `dns.lookup` we will focus on the main concept of all callback functions in node.js.

```javascript
const lookup = (host, callback) => {
  const ip; // do a specific operation by calling a dns service or library to resolve the ip address
  const family; // do the same thing to get the ip family A or AAAA

  if (/*there are any errors*/) {
    callback(errors);
  } else {
    callback(null, ip, family);
  }
}

module.exports = {
  lookup,
}
```

`lookup` function has 2 arguments `(host, callback)`. As we rightfully understand the callback is our parameter function that we previously used as the second parameter.

After we are retrieving the `ip` and `family` we will abstract the details of the implementation of how we do that.

And finally we use:

```javascript
if (/*there are any errors*/) {
  callback(errors);
} else {
  callback(null, ip, family);
}
```

This is the most common pattern used in node.js for creating and passing next the results to callbacks, so you should better understand it and put it in your node.js skill set.

> Why _error_ first argument, and why sending _null_ when we do not have one, and sending the results as following parameters ?

The error first callback pattern is a best practice among node.js devs, is an agreement not a forced lexical rule, and is a very practical approach. It is focused on proper error handling.

```javascript
function commonCallback(err, data) {
  if (err) {
    // log it in a logger file or just handle the output to the console
  } else {
    // operate on your data
  }
}
```
