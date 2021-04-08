const { Schema } = require('mongoose');

const establishmentTypeSchema = new Schema({
  establishmentTypeName: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = establishmentTypeSchema;
