const { Schema } = require('mongoose');

const eventStatusSchema = new Schema({
  eventStatusName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

module.exports = eventStatusSchema;
