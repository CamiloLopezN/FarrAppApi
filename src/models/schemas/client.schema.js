const { Schema } = require('mongoose');

const eventPreviewSchema = require('./eventPreview.schema');
const establishmentPreviewSchema = require('./establishmentPreview.schema');

const clientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, required: true },
  interests: [eventPreviewSchema],
  follows: [establishmentPreviewSchema],
});

clientSchema.plugin(require('mongoose-paginate-v2'));
clientSchema.plugin(require('mongoose-aggregate-paginate-v2'));

module.exports = clientSchema;
