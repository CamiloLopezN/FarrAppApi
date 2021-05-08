const { Schema } = require('mongoose');
const locationSchema = require('./location.schema');
const reviewSchema = require('./review.schema');
const eventPreviewSchema = require('./eventPreview.schema');

const establishmentSchema = new Schema({
  establishmentName: { type: String, required: true },
  establishmentTypes: { type: [String], required: true },
  categories: { type: [String], required: true },
  description: { type: String, required: true },
  logoUrl: { type: String, required: true },
  photoUrls: { type: [String], required: true },
  capacity: { type: Number, required: true },
  isActive: { type: Boolean },
  location: { type: locationSchema, required: true },
  averageRating: { type: Number },
  company: {
    type: {
      companyId: { type: String, required: true },
      companyName: { type: String, required: true },
    },
    required: true,
  },
  reviews: { type: [reviewSchema] },
  events: { type: [eventPreviewSchema] },
  followers: { type: Number },
});

establishmentSchema.methods.calculateAvgRating = function calculateAvgRating() {
  const sum = this.reviews.reduce((accum, review) => accum + Number(review.rating), 0);
  this.averageRating = sum / this.reviews.length;
};

module.exports = establishmentSchema;
