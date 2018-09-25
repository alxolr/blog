<img class="img img-responsive" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/debugging-tools-and-practices-in-node-js.jpg" alt="Debugging tools and practices in node.js"/>

# Summary

- [Intro](#intro)
- [Separate the environments](#separate-the-environments)
- [Increase the error stack trace](#increase-the-error-stack-trace)
- [Use a logging service](#use-a-logging-service)
- [Use debug package](#use-debug-package)
- [Debug node.js internals with NODE_DEBUG](#debug-nodejs-internals-with-node_debug)

## Intro

In this blog post I want to share what I learned lately concerning debugging best practices.

But first, we need to understand what is debugging.
When hearing the word debug the first thing that comes in mind to most developers are the break points where they stop the execution of the application to watch the state of the variables.

> I see __debugging__ as a process of identification and finding bugs (errors, non-conformities), not only in the moment of actual occurring but also all the prevention activities which you do to faster find them.

By having a set of rules or let call them best practices, you can greatly diminish the number of bugs in your project.

## Separate the environments

> Properly separate the environments from `development` and `production`.

I usually use the `config` npm module. Also the vast majority of big frameworks also are using this package, `express`, `feathers`.

My config folder would look in the following manner

```bash
+config/
  default.js
  development.js
  production.js
```

In order to run the application in a specific environment you will use the `process.env.NODE_ENV` variable where you can write in your `package.json` file

```javascript
//..
"scripts": {
    "start": "env NODE_ENV=development node index.js",
    //..
}
//..
```

Even if at the moment it is not very clear how the separation of environments help you with bug catching and debugging it will be very clear in the following chapters.

## Increase the error stack trace

> In _development_ increase the stack trace limit to a greater amount (100, Infinity).

Node.js comes by default with an error stack trace of 10 to reduce the amount of ram needed to store the data, when developing an application this is seldom ok. A good practice is to setup your `development` environment with an enhanced error stack trace limit, usually this is done in one of the two ways.

1. Using the `--stack-trace-limit` node argument, where you can provide a higher number, as 100 or more.

```bash
> node --stack-trace-limit=100 index.js
```

2. By setting up the `Error.stackTraceLimit`

When using the second method make sure you setup the stack trace as first as possible, usually in my `index.js` file I do have the following configuration.

```javascript

const express = require('express');
// module importing

if (process.env.NODE_ENV === 'development') {
  Error.stackTraceLimit = Infinity;
}
```

Actually when it comes to asynchronous stack traces node.js is performing very poor, without a proper setup it's practically impossible to understand where the error was thrown.

A good practice is to use the [longjohn](https://www.npmjs.com/package/longjohn) npm package in `development` mode. In this way my development configuration will be the following one.

```javascript
if (process.env.NODE_ENV === 'development') {
  Error.stackTraceLimit = Infinity;
  require('longjohn');
}
```

> Do not use anonymous functions, always name your functions in stack trace this will help you a lot to identify where the problem comes from.

```javascript

// BAD
const count = function() {
  // do something
}

// GOOD
const count = function count() {
}

```

Now in stack trace instead of `anonymous function` you will see `count()` way better and faster.

## Use a logging service

We all used and are using `console.log` but in production this is a bad practice. Because `console.log` has a very rigid interface, it outputs only to console which in node.js will be equal to the running terminal of your application.

What we want for production is a logger with more functionalities like:

- Writing into a separate file or a dedicated logging service
- Sending emails on uncaught errors
- Sending notifications in slack

> Good candidates for the following task are [winston](https://www.npmjs.com/package/winston) and [pino](https://github.com/pinojs/pino)

Personally I use mostly `winston` but `pino` is built with speed in mind, and have a bit of different philosophy.

```javascript
const logger = require('winston');

if (process.env.NODE_ENV === 'production') {
  logger.remove(logger.transports.Console);
}

logger.add(new logger.transports.File, {
  filename: 'combined.log',
}); // save the logs in a separate file

// you can add your own Custom Logger transports
logger.add(new SendEmailLogger());
```

> I do not advise to use the file transport, because node is a micro-service oriented platform and you will have multiple instances of the same application, so it will be a nightmare to merge the logs from every instance. A better approach will be to store the logs to a separate service, usually we use [kibana](https://www.elastic.co/products/kibana)

## Use `debug` package

With 1,000,000 downloads daily [debug](https://www.npmjs.com/package/debug) is one of the most used packages in node.js community. The simplicity of of this package and the benefits that you receive are invaluable.

If you are using a framework like `sails`, `express`, `feathers` or ORM's like `mongoose`, they already use this module. You can see the power of debug by running the following command:

on Windows:

```bash
> set DEBUG=* node index.js
```

on Linux, MacOS:

```bash
> env DEBUG=* node index.js
```

> Use _debug_ in your modules by providing a proper namespace.

If you create a npm package or even for your production code it is very advisable to have some debug logs.

Asynchronous nature of node.js makes it very hard sometimes to find where the bug comes from, and good debugging practices makes this job much easier.

```javascript
const debug = require('debug')('namespace');

module.exports = function someModule() {
  debug('started new module execution');

  // do some logic

  debug('finished the module execution');
}
```

Now when you run the following code

```bash
> DEBUG=namespace node index.js
```

You will have the output only for the namespace that you provided. You can join multiple namespaces by using `,` as following:

```bash
> DEBUG=namespace,express node index.js
```

## Debug node.js internals with `NODE_DEBUG`

There are times when you have a memory leak, or some streams are throwing uncaught exception then a very good tool to have in your arsenal is the `NODE_DEBUG` flag.

> NODE_DEBUG helps with debugging node.js internals

List of NODE_DEBUG attributes:

- timer
- http
- net
- fs
- cluster
- tls
- stream
- child_process
- module

You can try it out by using one or more debug options

```bash
> NODE_DEBUG=timer,http node index.js
```

As you observed `debug` npm package follows the same interface as the `NODE_DEBUG`, in this way it is easy to combine both of them.

To create your custom NODE_DEBUG namespaces you can use the `util.debuglog()` method.

```javascript
const util = require('util');
const log = util.debuglog('namespace');

log('my custom log [%d]', 45);
```

The output of the following code will be the following one

```bash
NAMESPACE 3245: my custom log [45]
```
