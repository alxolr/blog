'use strict';

const server = require('./src/server');
const config = require('config');

server.listen(config.port, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`server listening on ${server.server.address().port}`);
});

process.on('unhandledRejection', (err) => {
  server.log.error(err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  server.log.error(err);
});
