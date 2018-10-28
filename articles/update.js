'use strict';

/* eslint no-console: 0 */

const mongoose = require('mongoose');
const archive = require('./archive');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const config = require('../config/default');
const ArticleSchema = require('../src/models/articles.schema');

const id = process.argv[2];

mongoose.Promise = Promise;

mongoose.connect(config.mongoUri, {
  useMongoClient: true,
}, handleArticleUpdate);

const Article = mongoose.model('Article', ArticleSchema);

function handleArticleUpdate(err) {
  assert.equal(err, null);

  const article = archive.find(a => a.id === +id);
  if (article) {
    fs.readFile(path.join(__dirname, article.filePath), 'utf8', (rfErr, content) => {
      assert.equal(rfErr, null);
      article.content = content;

      Article.findOne({ slug: article.slug })
        .then((ar) => {
          Object.keys(article).forEach((key) => {
            ar[key] = article[key];
          });

          return ar.save();
        })
        .then(() => {
          console.log(`"${article.slug}" with id ${article.id} was updated`);
          mongoose.disconnect();
        })
        .catch((saveErr) => {
          console.error(saveErr);
          mongoose.disconnect();
        });
    });
  } else {
    throw new Error(`"${id}" was not found in archive/index.json`);
  }
}

process.on('uncaughtException', (err) => {
  console.error(err);
  mongoose.disconnect();
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  mongoose.disconnect();
});
