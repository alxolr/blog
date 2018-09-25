'use strict';

/* eslint no-console:0 */

const readline = require('readline');
const fs = require('fs');
const voca = require('voca');
const assert = require('assert');
const path = require('path');
const archive = require('./archive');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Add the article title:\n', (title) => {
  const slug = voca.slugify(title);
  const filePath = path.join(__dirname, `archive/${slug}.md`);
  const tags = [];

  let maxId = 0;
  if (archive.length) {
    maxId = Math.max(...archive.map(a => a.id));
  }

  const id = maxId + 1;

  fs.writeFile(filePath, '', (err) => {
    assert.equal(err, null);
    archive.push({
      id,
      title,
      slug,
      filePath: `archive/${slug}.md`,
      teaser: '',
      image: '',
      tags,
      createdAt: new Date(),
    });

    fs.writeFile(path.join(__dirname, './archive/index.json'), JSON.stringify(archive, null, 2), (error) => {
      assert.equal(error, null);
      console.log(`"${slug}" with id ${id} was created`);
      rl.close();
    });
  });
});
