'use strict';

require('marko/node-require');

const config = require('config');
const path = require('path');
const fastify = require('fastify')({
  logger: {
    level: 'error'
  }
});

const isProduction = process.env.NODE_ENV === 'production';
const outputDir = path.join(__dirname, '..', 'static');

require('lasso').configure({
  plugins: [
    'lasso-marko'
  ],
  outputDir: outputDir,
  bundlingEnabled: isProduction,
  minify: isProduction,
  fingerprintsEnabled: isProduction,
});

fastify.register(require('point-of-view'), {
  engine: {
    marko: require('marko')
  },
  templates: './src/templates'
});

fastify.register(require('fastify-static'), {
  root: outputDir,
  prefix: '/static'
});

fastify.register(require('fastify-mongoose'), {
  uri: config.mongoUri
});

fastify.register(require('./models'));
fastify.register(require('./routes/index'), { debugLevel: 'error' });
fastify.register(require('./routes/articles'));
fastify.register(require('./routes/subscribers'));

fastify.setNotFoundHandler(function (request, reply) {
  reply.view('404.marko', {
    title: 'Resource not found'
  });
});

fastify.register(require('fastify-compress'));

module.exports = fastify;
