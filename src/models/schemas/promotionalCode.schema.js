const { Schema } = require('mongoose');

const promotionalCodeSchema = new Schema({
  codeString: { type: String, required: true, unique: true },
  totalValidExchanges: { type: Number, required: true },
  remainingValidExchanges: { type: Number },
  discountRate: { type: Number, required: true },
  discountType: { type: String, required: true },
});

module.exports = promotionalCodeSchema;
