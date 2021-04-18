const { Schema } = require('mongoose');

const eventPreviewSchema = require('./eventPreview.schema');
const establishmentPreviewSchema = require('./establishmentPreview.schema');

const clientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'Users' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, required: true },
  interests: [eventPreviewSchema],
  follows: [establishmentPreviewSchema],
});

module.exports = clientSchema;
