'use strict';

const ArticleSchema = require('./articles.schema');
const SubscribeSchema = require('./subscriber.schema');

function load(fastify, opts, next) {
  fastify.mongo.db.base.model('Article', ArticleSchema);
  fastify.mongo.db.base.model('Subscriber', SubscribeSchema);
  
  next();
}


module.exports = load;
