const { Schema } = require('mongoose');

const establishmentPreviewSchema = new Schema({
  id: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'establishments' },
  establishmentName: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: String, required: true },
});

module.exports = establishmentPreviewSchema;
