'use strict';

const server = require('./src/server');
const config = require('config');

const start = async () => {
  try {
    await server.listen(config.port);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  server.log.error(err);
  process.exit(1);
});

start();
