'use strict';

/* eslint no-console: 0 */

const mongoose = require('mongoose');
const archive = require('./archive');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const Article = require('../src/models/articles.model');

const id = process.argv[2];

mongoose.Promise = Promise;

mongoose.connect(config.database.url, {
  useMongoClient: true,
}, handleArticlePublication);


function handleArticlePublication(err) {
  assert.equal(err, null);

  const article = archive.find(a => a.id === +id);
  if (article) {
    fs.readFile(path.join(__dirname, article.filePath), 'utf8', (rfErr, content) => {
      assert.equal(rfErr, null);

      article.content = content;

      new Article(article).save()
        .then((doc) => {
          console.log(`"${article.slug}" with id ${article.id} was published mongo id ${doc._id.toHexString()} \n`);
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
