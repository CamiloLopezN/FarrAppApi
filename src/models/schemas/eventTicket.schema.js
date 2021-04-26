const { Schema } = require('mongoose');
const promotionalCodeSchema = require('./promotionalCode.schema');

const eventTicketSchema = new Schema({
  ticketName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  onlinePrice: { type: Number, required: true },
  onDoorPrice: { type: String, required: true },
  isFastLine: { type: Boolean, required: true },
  totalAvailable: { type: Number, required: true },
  salesStart: { type: Date, required: true },
  salesEnd: { type: Date, required: true },
  status: { type: String, required: true },
  isTransferable: { type: Boolean, required: true },
  maxPerPurchase: { type: Number, required: true },
  minPerPurchase: { type: Number, required: true },
  otherInfo: { type: String },
  promotionalCodes: [promotionalCodeSchema],
});

module.exports = eventTicketSchema;
