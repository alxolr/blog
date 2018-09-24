'use strict';

async function routes(fastify) {
  fastify.get('/', async (request, reply) => {

    const { Article } = fastify.mongo.db.models;

    const articles = await Article.getArticles();

    return reply.view('index.marko', {
      title: 'Welcome',
      articles,
    });
  });
}

module.exports = routes;
