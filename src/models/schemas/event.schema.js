const { Schema } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const locationSchema = require('./location.schema');
const reviewSchema = require('./review.schema');
const eventTicketSchema = require('./eventTicket.schema');

const eventSchema = new Schema({
  eventName: { type: String, required: true },
  description: { type: String, required: true },
  establishment: {
    type: {
      establishmentId: { type: String, required: true },
      establishmentName: { type: String, required: true },
    },
    required: true,
  },
  minAge: { type: Number, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, required: true },
  location: { type: locationSchema, required: true },
  capacity: { type: Number, required: true },
  photoUrls: { type: [String], required: true },
  categories: { type: [String], required: true },
  dressCodes: { type: [String], required: true },
  averageRating: { type: Number },
  tickets: { type: [eventTicketSchema], required: true },
  reviews: [reviewSchema],
});

eventSchema.plugin(uniqueValidator);

module.exports = eventSchema;
