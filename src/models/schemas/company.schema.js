const { Schema } = require('../../config/config.database');
const eventPreviewSchema = require('./eventPreview.schema');
const establishmentPreviewSchema = require('./establishmentPreview.schema');

const companySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },
    companyName: { type: String, unique: true, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    nit: { type: String, required: true, unique: true },
    establishments: [establishmentPreviewSchema],
    events: [eventPreviewSchema],
    customerId: { type: String },
  },
  {
    timestamps: true,
  },
);

companySchema.plugin(require('mongoose-unique-validator'));
companySchema.plugin(require('mongoose-paginate-v2'));
companySchema.plugin(require('mongoose-aggregate-paginate-v2'));

module.exports = companySchema;
