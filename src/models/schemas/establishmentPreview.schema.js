const { Schema } = require('mongoose');

const establishmentPreviewSchema = new Schema({
  establishmentName: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: String, required: true },
});

module.exports = establishmentPreviewSchema;
