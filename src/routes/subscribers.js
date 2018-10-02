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

  fastify.get('/unsubscribe/:apiKey', (request, reply) => {
    Subscriber.findOne({ apiKey: request.params.apiKey })
      .then((subscriber) => {
        if (subscriber) {
          subscriber.subscribed = false;

          return subscriber.save();
        }

        return subscriber;
      })
      .then(() => reply.view('unsubscribe.marko', {}));
  });

  next();
}

module.exports = routes;
