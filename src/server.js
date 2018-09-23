'use strict';

require('marko/node-require');
const path = require('path');
const fastify = require('fastify')({
  logger: true
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

fastify.register(require('./routes'));

module.exports = fastify;
