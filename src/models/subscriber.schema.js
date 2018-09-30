'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
    apiKey: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

require('../repositories/subscribers.repository')(SubscriberSchema);
module.exports = SubscriberSchema;
