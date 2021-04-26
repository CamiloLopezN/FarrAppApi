const { Schema } = require('mongoose');
const locationSchema = require('./location.schema');

const establishmentPreviewSchema = new Schema({
  establishmentId: {
    type: String,
    required: true,
  },
  companyId: { type: String, required: true },
  establishmentName: { type: String, required: true },
  location: { type: locationSchema, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, required: true },
});

module.exports = establishmentPreviewSchema;
