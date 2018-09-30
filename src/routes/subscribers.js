'use strict';

function routes(fastify, opts, next) {
  const { Subscriber } = fastify.mongo.db.models;

  fastify.post('/subscribe', (request, reply) => {
    const subscriber = new Subscriber(request.body);
    subscriber.save()
      .then(() => {
        reply
          .send({ success: true })
          .code(200);
      })
      .catch((err) => {
        reply
          .code(400)
          .send({ error: err.message });
      });
  });

  fastify.get('/unsubscribe/:token', (request, reply) => {
  });

  next();
}

module.exports = routes;
