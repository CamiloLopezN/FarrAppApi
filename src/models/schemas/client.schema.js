const { Schema } = require('mongoose');

const userSchema = require('./user.schema');
const eventPreviewSchema = require('./eventPreview.schema');
const establishmentPreviewSchema = require('./establishmentPreview.schema');

const clientSchema = new Schema({
  user: { type: userSchema, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, required: true },
  interests: [eventPreviewSchema],
  follows: [establishmentPreviewSchema],
});

module.exports = clientSchema;
