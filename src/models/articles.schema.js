'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArticleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    teaser: {
      type: String,
    },
    image: {
      type: String,
    },
    tags: {
      type: [String],
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ArticleSchema.index({ title: 'text', slug: 'text', teaser: 'text', content: 'text' });
require('../repositories/articles.repository')(ArticleSchema);

module.exports = ArticleSchema;
