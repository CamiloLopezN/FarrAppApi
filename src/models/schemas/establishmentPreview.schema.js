const { Schema } = require('mongoose');

const establishmentPreviewSchema = new Schema({
  establishmentId: {
    type: String,
    required: true,
  },
  establishmentName: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, required: true },
});

module.exports = establishmentPreviewSchema;
