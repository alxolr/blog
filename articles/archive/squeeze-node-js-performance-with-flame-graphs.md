<img class="img-fluid" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/squeeze-node-js-performance-with-flame-graphs-min.jpg" alt="Squeeze node.js performance with flame graphs"/>

# Summary

- [Intro](#intro)
- [Flame graphs](#flame-graphs)
- [Seed data](#seed-data)
- [Creating the api](#creating-the-api)
- [Initial benchmark](#initial-benchmark)
- [Profiling with flame graphs](#profiling-with-flame-graphs)
- [Squeezing more performance](#squeezing-more-performance)
- [Conclusions](#conclusions)

## Intro

Even if node.js is natively lightning fast there are times when we need to squeeze even more performance. In this article, we will investigate the most useful tools used by node.js masters to skyrocket the performance of their systems.

The first tool will be [flame graphs](http://www.brendangregg.com/flamegraphs.html)

## Flame graphs

> _Flame graphs_ are a CPU profiling visualization technique that helps to spot at glance the most frequently used function, and most importantly the time they need to run.

<img class="img-fluid img-full" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/flame-graphs-example.png" alt="Flame graph example"/>

On y-axis will be the stack trace height, on the x-axis the CPU time for the function to finish.

> Big and wide flames = Excessive CPU usage
> High and thin flames = Low CPU usage // low is better

In the context of node.js this is critically important because when your CPU is busy the event loop can't pass the execution to the next tick this means decreased performance.

> A very useful tool to generate flame graphs for node.js is __[0x](https://www.npmjs.com/package/0x)__.

In this tutorial, we will create an API that we will use for our optimization techniques.

## Seed data

Let's start by loading some seed data in our MongoDB database.

```javascript
// load.js
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

let count = 0;
const max = 10000;

MongoClient.connect(url, (err, client) => {
  if (err) { throw err };
  const db = client.db('skillshop');
  const collection = db.collection('carts');
  function insert(err) {
    if (err) throw err;

    if (count++ === max) {
      return client.close();
    }

    collection.insert({
      cart: parseInt(Math.random() * 100),
      quantity: parseInt(Math.random() * 10) + 1,
      price: Math.random() * 1000,
    }, insert);
  }

  insert();
});


process.on('uncaughtException', (ex) => {
  console.error(ex);
});
```

Now let's load our seed data into `skillshop` database into the `carts` collection.

```bash
node load.js
```

## Creating the api

This time we will choose my friend's [micnic](https://github.com/micnic) server called `simples`;
He is a super strong javascript developer, the first one who mentored me in the javascript world.

> [simpleS](https://github.com/micnic/simpleS) - is a simple web framework for Node.JS designed to create HTTP(S) servers and clients.

Now let's create a file server.js with the following code:

```javascript
// server.js
const simples = require('simples');
const { MongoClient } = require('mongodb');
const assert = require('assert');

const port = process.env.PORT || 8080;
const mongoUri = 'mongodb://localhost:27017';

MongoClient.connect(mongoUri, connectClient);

function connectClient(err, client) {
  assert.ifError(err);

  const db = client.db('skillshop');
  const collection = db.collection('carts');

  const server = simples(port);

  server.get('/carts/:id', function get(conn) {
    const cart = parseInt(conn.params.id);

    collection.find({ cart }).toArray((err, results) => {
      assert.ifError(err);

      const total = results.reduce((a, e) => a += e.price * e.quantity, 0);

      conn.send({ total });
    });
  });
}
```

> Our API has a single endpoint `/carts/:id` which counts the total amounts of money for a specific cart.

## Initial benchmark

We will benchmark our api using [Apache Benchmark](https://httpd.apache.org/docs/2.4/programs/ab.html)

```bash
ab -c500 -t10 http://localhost:8080/carts/3

Complete requests:      3998
Requests per second:    399.74 [#/sec] (mean)
Time per request:       1250.825 [ms] (mean)
Time per request:       2.502 [ms] (mean, across all concurrent requests)
Transfer rate:          52.70 [Kbytes/sec] received
```

> 3998 completed requests on average 399 req/s it's a good result but we can get better.

## Profiling with flame graphs

Now let's start our server using 0x tool and start the benchmark from scratch.

```bash
0x server.js
```

```bash
ab -c500 -t10 http://localhost:8080/carts/3
```
After we need to press CTRL + C to build the flame graph, you will get something like

```bash
🔥  Flamegraph generated in
file:///home/alxolr/Work/simple-server/4471.0x/flamegraph.html
```

<img class="img-fluid img-full" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/3068adcc-c249-4e2c-b90d-531e08045fbb.png" alt="First flamegraph profile session"/>

As we can see on top of our callstack we have wide functions in red called `deserializeObject` the problem with this functions is that they are already optimized. They are used by MongoDB driver to deserialize the BSON into JSON objects. We need to factor our code in a way that we reduce the numbers of calls to `deserializeObject`.

We can safely guess that the problem in our code comes from the following part:

```javascript
collection.find({ cart }).toArray((err, results) => {
  assert.ifError(err);

  const total = results.reduce((a, e) => a += e.price * e.quantity, 0);

  conn.send({ total });
});
```

`toArray` function returns an array of objects which internally for each one is using `deserializeObject`.

We will start our improvement by using mongodb [aggregation framework](https://docs.mongodb.com/manual/aggregation/) to do the reduce computation of our total field in ram, and deserialize our single response object.

```javascript
server.get('/carts/:id', function get(conn) {
    const cart = parseInt(conn.params.id);

    const pipelines = [
      { $match: { cart, } },
      { $group: { _id: '$cart', total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
    ];

    collection.aggregate(pipelines, function (err, data) {
      if (err) console.error(err);

      data.toArray((err, docs) => {
        if (err) {
          conn.send({error: err.message})
          return;
        }

        conn.send(docs[0]);
        return;
      })
    });
  });
```

Now we will run our benchmark and compare the results:

```bash
ab -c500 -t10 http://localhost:8080/carts/3

Complete requests:      4137
Requests per second:    413.69 [#/sec] (mean)
Time per request:       1208.621 [ms] (mean)
Time per request:       2.417 [ms] (mean, across all concurrent requests)
Transfer rate:          57.77 [Kbytes/sec] received
```

> 4137 completed requests on average 413 req/s. We got a __3 %__ performance increase. To be truthful I was expecting a better result, but still, we got a relatively small improvement.

I was thinking why we got such a poor result and then I remembered that we do not have a single index on our mongodb collection and the aggregate was iterating every time the 10'000 document collection. I added an index on cart field `db.collection('carts').createIndex({cart: 1})` and started the benchmark from scratch.

```bash
ab -c500 -t10 http://localhost:8080/carts/3

Complete requests:      25686
Requests per second:    2568.59 [#/sec] (mean)
Time per request:       194.659 [ms] (mean)
Time per request:       0.389 [ms] (mean, across all concurrent requests)
Transfer rate:          358.89 [Kbytes/sec] received
```

> ~25000 requests on average 2500 req/s. After adding an index we got __642%__ performance increase. This is much closer to what I was expecting.

## Squeezing more performance

Is it the top? Can we get even more performance? Let's profile one more time and see if there are any hot paths that we can optimize.

<img class="img-fluid img-full" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/after-optimization-flame-graph.png" alt="After optimization flame graph"/>

From the image we, can see that on the red parts it rest only core node.js modules. That usually signifies that to optimize even more we need to rewrite some core features or to factor our code that the functions in red are used less. This is not always possible.

> When you squeezed the maximum juice out of your tools you can still go further by using a caching mechanism.

Let's use then [lru-cache](https://www.npmjs.com/package/lru-cache) in combination with [fastq](https://www.npmjs.com/package/fastq).

Our new code will look like the following one;

```javascript
'use strict';

const simples = require('simples');
const { MongoClient } = require('mongodb');
const assert = require('assert');
const LRU = require('lru-cache');
const fastq = require('fastq');

const port = process.env.PORT || 8080;
const mongoUri = 'mongodb://localhost:27017';

MongoClient.connect(mongoUri, connectClient);

const cache = LRU({
  max: 100,
  maxAge: 5 * 1000,
});

function connectClient(err, client) {
  assert.ifError(err);

  const db = client.db('skillshop');
  const collection = db.collection('carts');

  const server = simples(port);
  const queue = fastq(worker);

  function worker(cart, cb) {
    if (cache.get(cart)) {
      cb(null, cache.get(cart));
    } else {
      const pipelines = [
        { $match: { cart, } },
        { $group: { _id: '$cart', total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
      ];

      collection.aggregate(pipelines, function (err, data) {
        if (err) console.error(err);

        data.next()
          .then((value) => {
            cache.set(cart, value);
            cb(null, value);
          })
          .catch(cb)
      });
    }
  }

  server.get('/carts/:id', function get(conn) {
    const cart = parseInt(conn.params.id);

    queue.push(cart, (err, result) => {
      if (err) {
        conn.send({ err: err.message });
        return;
      }

      conn.send(result);
      return;
    });
  });
}
```

When we run the benchmarks we got the following results:

```bash
Complete requests:      50000
Requests per second:    5071.28 [#/sec] (mean)
Time per request:       98.594 [ms] (mean)
Time per request:       0.197 [ms] (mean, across all concurrent requests)
Transfer rate:          708.20 [Kbytes/sec] received
```

> After adding the caching mechanism we practically doubled the request per second. Not so bad for a day of work.

## Conclusions

Profiling and optimization is a sequential process that is done in 4 steps:

- Initial benchmark
- Finding an optimization strategy using tools like (flame graphs, CPU profiling)
- Code refactor and optimization
- After optimization benchmark

This process can be run indefinitely, there are always better ways and techniques to write our code.

_Hope that this article was helpful if you like it please share with your friends, and leave a feedback comment, I will gladly answer all the questions._
