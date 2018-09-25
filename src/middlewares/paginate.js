'use strict';

const config = require('config');

function buildPagination(params) {
  const page = params.page || 1;
  const paginate = {
    current: page,
    limit: config.limit,
    skip: (page - 1) * config.limit
  };

  return paginate;
}

module.exports = buildPagination;
