'use strict';

const buildPagination = require('../middlewares/paginate');

async function routes(fastify) {
  fastify.get('/', async (request, reply) => {
    const { Article } = fastify.mongo.db.models;
    const pagination = buildPagination(request.query);
    const [total, articles] = await Article.getArticles(pagination);

    const paginate = {
      ...pagination,
      total: parseInt(total / pagination.limit)
    };

    return reply.view('index.marko', {
      title: 'Welcome',
      articles,
      paginate,
    });
  });
}

module.exports = routes;
