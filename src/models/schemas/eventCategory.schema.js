const { Schema } = require('mongoose');

const eventCategorySchema = new Schema({
  eventCategoryName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

module.exports = eventCategorySchema;
