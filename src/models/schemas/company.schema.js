const { Schema } = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');
const userSchema = require('./user.schema');
const eventPreviewSchema = require('./eventPreview.schema');
const establishmentPreviewSchema = require('./establishmentPreview.schema');

const companySchema = new Schema({
  user: { type: userSchema, required: true },
  companyName: { type: String, unique: true, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  nit: { type: String, required: true, unique: true },
  establishments: [establishmentPreviewSchema],
  events: [eventPreviewSchema],
});

companySchema.plugin(uniqueValidator);

module.exports = companySchema;
