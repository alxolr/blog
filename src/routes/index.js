'use strict';

const buildPagination = require('../middlewares/paginate');

function routes(fastify, opts, next) {
  const { Article } = fastify.mongo.db.models;

  fastify.get('/search', (request, reply) => {
    const pagination = buildPagination(request);

    Article.searchArticles(request.query.q, pagination)
      .then(handleArticles);

    function handleArticles([total, articles]) {
      const paginate = {
        ...pagination,
        pages: parseInt(Math.ceil(total / pagination.limit)) || 1,
        items: articles.length,
        total
      };

      reply.view('index.marko', {
        title: 'Search' + request.query.q,
        articles,
        paginate,
      });
    }
  });

  fastify.get('/', (request, reply) => {
    const pagination = buildPagination(request);

    Article.getArticles(pagination)
      .then(handleArticles);

    function handleArticles([total, articles]) {
      const paginate = {
        ...pagination,
        pages: parseInt(Math.ceil(total / pagination.limit)) || 1,
        items: articles.length,
        total
      };

      reply.view('index.marko', {
        title: 'Welcome',
        articles,
        paginate,
      });
    }
  });

  next();
}

module.exports = routes;
