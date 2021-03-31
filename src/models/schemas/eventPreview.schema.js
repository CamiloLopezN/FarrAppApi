const { Schema } = require('mongoose');

const eventPreviewSchema = new Schema({
  eventName: { type: String, required: true },
  city: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  imageUrl: { type: String, required: true },
});

module.exports = eventPreviewSchema;
