const { Schema } = require('mongoose');

const eventPreviewSchema = new Schema({
  eventId: { type: String, required: true },
  establishmentId: { type: String, required: true },
  companyId: { type: String, required: true },
  eventName: { type: String, required: true },
  city: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  imageUrl: { type: String, required: true },
  capacity: { type: Number, required: true },
  minAge: { type: Number, required: true },
  categories: { type: [String], required: true },
  dressCodes: { type: [String], required: true },
  status: { type: String, required: true },
  interested: { type: Number },
});

module.exports = eventPreviewSchema;
