'use strict';

async function routes(fastify, options) {
  fastify.get('/articles', async (request, reply) => {
    return reply.view('index.marko', {
      name: 'Frank',
      count: 30,
      colors: ['red', 'green', 'blue']
    });
  });
}

module.exports = routes;
