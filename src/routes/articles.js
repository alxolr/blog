'use strict';

async function routes(fastify) {
  fastify.get('/articles/:slug', async (request, reply) => {
    const { Article } = fastify.mongo.db.models;

    const article = await Article.getArticleBySlug(request.params.slug);

    return reply.view('article.marko', {
      title: article.title,
      article,
    });
  });
}

module.exports = routes;
