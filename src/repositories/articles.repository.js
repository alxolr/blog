'use strict';

module.exports = (ArticleSchema) => {
  ArticleSchema.statics = {
    getArticleBySlug,
    getArticlesByTag,
    getArticles,
    getRelatedArticles,
    searchArticles,
    getTagsCloud,
  };

  function getTagsCloud() {
    setTimeout(() => {
      getTagsCloud.cache = null;
    }, 5 * 60 * 1000); // clean the cache after 5 minutes;

    return getTagsCloud.cache || (getTagsCloud.cache = getClouds.bind(this)());

    function getClouds() {
      const pipelines = [
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ];

      return this.aggregate(pipelines);
    }
  }

  function getArticleBySlug(slug) {
    return this.findOne({ slug });
  }


  function getArticlesByTag(tags, opts) {
    const query = {
      tags,
    };

    return Promise.all([
      this.count(query),
      this.find(query)
        .sort({ createdAt: -1 })
        .limit(opts.limit)
        .skip(opts.skip)
        .lean()
    ]);
  }


  function getArticles(opts) {
    return Promise.all([
      this.count(),
      this.find({})
        .sort({ createdAt: -1 })
        .limit(opts.limit)
        .skip(opts.skip)
        .lean()
    ]);
  }

  function searchArticles(searchTerm, opts) {
    const query = {
      $text: {
        $search: searchTerm,
      },
    };
    const score = { score: { $meta: 'textScore' } };

    return Promise.all([
      this.count(query),
      this.find(query, score)
        .sort({ createdAt: -1 })
        .limit(opts.limit)
        .skip(opts.skip)
        .lean()
    ]);
  }

  async function getRelatedArticles(tags, ignore) {
    const search = tags.map(tag => this.getArticlesByTag(tag, ignore));
    const related = await Promise.all(search);
    const flatted = related.reduce((acc, articles) => {
      acc = acc.concat(articles);

      return acc;
    }, []);

    const unique = [];

    flatted.forEach((item) => {
      if (!unique.filter(it => it.slug === item.slug).length) {
        unique.push(item);
      }
    });

    return unique.slice(0, 2);
  }

  ArticleSchema.pre('save', estimateReadingTime);
  ArticleSchema.pre('update', estimateReadingTime);
};

function estimateReadingTime(next) {
  this.readTime = parseInt((this.content.length * 0.1) / 60, 10);

  next();
}
