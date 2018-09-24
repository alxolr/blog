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

  function getArticlesByTag(tags, ignore = null) {
    const query = {
      tags,
    };

    if (ignore) {
      query.slug = {
        $ne: ignore,
      };
    }

    return this.find(query)
      .sort({ createdAt: -1 })
      .select('-content')
      .lean();
  }

  function getArticleBySlug(slug) {
    return this.findOne({ slug });
  }

  function getArticles(queryParams) {
    return this.find(queryParams).sort({ createdAt: -1 }).lean();
  }

  function searchArticles(searchTerm) {
    const query = {
      $text: {
        $search: searchTerm,
      },
    };
    const score = { score: { $meta: 'textScore' } };

    return this.find(query, score)
      .select('-content')
      .sort({ createdAt: -1, score: { $meta: 'textScore' } })
      .lean();
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
