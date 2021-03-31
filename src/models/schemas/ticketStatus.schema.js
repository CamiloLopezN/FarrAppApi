const { Schema } = require('mongoose');

const ticketStatusSchema = new Schema({
  ticketStatusName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

module.exports = ticketStatusSchema;
