'use strict';

const { buildArticleOGTags, buildPagination } = require('../utils');
function routes(fastify, opts, next) {
  const { Article } = fastify.mongo.db.models;

  fastify.get('/articles/tags/:tag', (request, reply) => {
    const pagination = buildPagination(request);

    Article.getArticlesByTag(request.params.tag, pagination)
      .then(handleArticles);

    function handleArticles([total, articles]) {
      const paginate = {
        ...pagination,
        pages: parseInt(Math.ceil(total / pagination.limit)) || 1,
        items: articles.length,
        total
      };

      reply.view('index.marko', {
        title: 'Tag' + request.params.tag,
        articles,
        paginate,
      });
    }
  });


  fastify.get('/articles/:slug', (request, reply) => {
    Article.getArticleBySlug(request.params.slug)
      .then(handleArticleBySlug);

    function handleArticleBySlug(article) {
      reply.view('article.marko', {
        title: article.title,
        article,
        og: buildArticleOGTags(article)
      });
    }
  });

  next();
}

module.exports = routes;
