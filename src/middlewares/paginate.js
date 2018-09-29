'use strict';

const config = require('config');
const url = require('url');

function buildPagination(request) {
  const page = request.query.page || 1;
  const paginate = {
    current: page,
    limit: config.limit,
    basePath: url.parse(request.raw.originalUrl).pathname,
    searchParams: request.query,
    skip: (page - 1) * config.limit
  };

  return paginate;
}

module.exports = buildPagination;
