const { Schema } = require('mongoose');

const userSchema = require('./user.schema');
const eventPreviewSchema = require('./eventPreview.schema');
const establishmentPreviewSchema = require('./establishmentPreview.schema');

const clientSchema = new Schema({
  user: { type: userSchema, required: true },
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  nit: { type: String, required: true },
  establishments: [eventPreviewSchema],
  events: [establishmentPreviewSchema],
});

module.exports = clientSchema;
