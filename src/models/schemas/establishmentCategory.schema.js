const { Schema } = require('mongoose');

const establishmentCategorySchema = new Schema({
  establishmentCategoryName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

module.exports = establishmentCategorySchema;
