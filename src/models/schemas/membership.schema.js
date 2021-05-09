const { Schema } = require('mongoose');

const membershipSchema = new Schema({
  orderReference: { type: String, required: true },
  orderStatus: { type: String, required: true },
  orderDate: { type: Date, required: true },
  description: { type: String, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  paymentType: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  price: { type: Number, required: true },
  tax: { type: Number, required: true },
  interval: { type: String, required: true },
  intervalCount: { type: Number, required: true },
});

module.exports = membershipSchema;
