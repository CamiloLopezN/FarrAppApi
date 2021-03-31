const { Schema } = require('mongoose');

const genderSchema = new Schema({
  genderName: { type: String, required: true, unique: true },
});

module.exports = genderSchema;
