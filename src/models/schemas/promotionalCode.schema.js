const { Schema } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const promotionalCodeSchema = new Schema({
  codeString: { type: String },
  totalValidExchanges: { type: Number, required: true },
  remainingValidExchanges: { type: Number },
  discountRate: { type: Number, required: true },
  discountType: { type: String, required: true },
});

promotionalCodeSchema.plugin(uniqueValidator);

module.exports = promotionalCodeSchema;
