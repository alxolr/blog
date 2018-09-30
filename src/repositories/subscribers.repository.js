'use strict';

const uuid = require('uuid/v4');

module.exports = (SubscriberSchema) => {
  SubscriberSchema.statics = {
  };

  SubscriberSchema.pre('save', function (next) {
    this.apiKey = uuid();
    next();
  });
};
