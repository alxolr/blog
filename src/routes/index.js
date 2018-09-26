'use strict';

const buildPagination = require('../middlewares/paginate');

function routes(fastify, opts, next) {
  fastify.get('/', (request, reply) => {
    const { Article } = fastify.mongo.db.models;
    const pagination = buildPagination(request.query);

    Article.getArticles(pagination)
      .then(handleArticles);

    function handleArticles([total, articles]) {
      const paginate = {
        ...pagination,
        total: parseInt(total / pagination.limit)
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
