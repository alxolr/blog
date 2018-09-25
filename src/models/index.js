'use strict';

const ArticleSchema = require('./articles.schema');

async function load(fastify) {
  fastify.mongo.db.base.model('Article', ArticleSchema);

  return;
}


module.exports = load;
