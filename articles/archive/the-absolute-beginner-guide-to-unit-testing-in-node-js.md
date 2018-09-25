<img class="img-fluid" src="https://s3.eu-central-1.amazonaws.com/alxolr-images-bk328/test-670091_1280.png" alt="The absolute beginner guide to unit testing in node.js"/>

## Intro

In this tutorial, we will focus on testing a simple module.

The best way to explain something is by practice. We will create a simple module in javascript and then we will test it.

## Module

Let's create a simple module named _append world_.

- Create a folder named _simple-module_
- Run inside the folder `npm init -y`

This will create the package.json file

- Create a file called _append-world.js_

With the following code:

```javascript
// append-world.js

'use strict';

function appendWorld(str) {
  return `${str} World`;
}

module.exports = appendWorld;
```

Now let's create a unit test for our module.

## Unit test

The first thing we need to install our test runner.

> A _test runner_ is a very simple program that executes our tests and shows the results.

For this tutorial, we will use [mocha](https://mochajs.org/)

- Run `npm install mocha --save-dev`

Next we need to create a _test_ folder.

- Create the `test` folder
- Inside `test/` create `append-world.test.js` file

```javascript
// test/append-world.test.js

'use strict';

const assert = require('assert');
const appendWorld = require('../append-world.js');

describe('appendWorld', () => {

  it('should append world to the end of each string', () => {
      const str = 'Hello';
      const expected = 'Hello World';

      assert.equal(appendWorld(str), expected);
  });
});

```

Now what we can do is to edit the _package.json_ file and add there the following line.

```javascript
"scripts": {
    "test": "mocha --recursive"
},
```

After we can run our tests by simply using the following command:

```bash
$ npm test

mocha --recursive

 appendWorld
    ✓ should append world to the end of each string
```

And we will get the output of our tests in the console.
