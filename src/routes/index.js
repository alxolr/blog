'use strict';

async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return reply.view('index.marko', {
      title: 'Home'
    });
  });
}

module.exports = routes;
