const { Schema } = require('mongoose');

const locationSchema = new Schema({
  latitude: { type: Number, required: true, unique: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, unique: true, min: -180, max: 180 },
  address: { type: String, required: true },
  city: { type: String, required: true },
});

module.exports = locationSchema;
