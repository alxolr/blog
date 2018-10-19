'use strict';

/* eslint no-console: 0 */

const mongoose = require('mongoose');
const archive = require('./archive');
const assert = require('assert');
const config = require('../src/config');
const Subscriber = require('../src/models/subscribers.model');
const mailer = require('../src/services/sendgrid-mailer');

const id = process.argv[2];

mongoose.Promise = Promise;

mongoose.connect(config.database.url, {
  useMongoClient: true,
}, handleNotifySubscribers);

function handleNotifySubscribers(err) {
  assert.ifError(err);

  Subscriber.find({ subscribed: true })
    .then(notifySubscribers)
    .then(() => mongoose.disconnect());
}

function notifySubscribers(subscribers) {
  const max = subscribers.length;
  let index = 0;

  function send() {
    const subscriber = subscribers[index];
    loadArticle(id, (err, article) => {
      assert.ifError(err);

      const message = buildMessage(subscriber, article);
      mailer.send(message, (emailError) => {
        assert.ifError(emailError);
        console.log(`${index + 1} ${subscriber.email} - email sent \n`);
        index += 1;

        if (index < max) {
          send();
        }
      });
    });
  }

  send();
}


function buildMessage(subscriber, article) {
  const subject = `Checkout latest article "${article.title}"`;
  const text = `Hi friend,
    It's Alex from alxolr.com, i've just added a new article
    https://alxolr.com/articles/${article.slug}.

    I want badly to know what do you think about it.
    If you have any questions you can email me at alxolr@gmail.com, I will gladly respond.

    Best regards,
    Your node.js enthusiast
    Alexandru Olaru

    In order to unsubscribe please follow the next url:
    https://alxolr.com/unsubscribe?apiKey=${subscriber.apiToken}
  `;

  return {
    from: 'alxolr@gmail.com',
    to: subscriber.email,
    subject,
    text,
  };
}


function loadArticle(articleId, cb) {
  const article = archive.find(a => a.id === +id);

  if (article) {
    cb(null, article);
    return;
  }

  cb(new Error('Article not found'));
  return;
}

process.on('uncaughtException', (err) => {
  console.error(err);
  mongoose.disconnect();
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  mongoose.disconnect();
});
