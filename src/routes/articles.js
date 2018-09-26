'use strict';

function routes(fastify, opts, next) {
  fastify.get('/articles/:slug', (request, reply) => {
    const { Article } = fastify.mongo.db.models;

    Article.getArticleBySlug(request.params.slug)
      .then(handleArticleBySlug);

    function handleArticleBySlug(article) {
      reply.view('article.marko', {
        title: article.title,
        article,
      });
    }
  });

  next();
}

module.exports = routes;
