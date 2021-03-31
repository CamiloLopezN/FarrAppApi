const { Schema } = require('mongoose');

const roleSchema = new Schema({
  roleName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

module.exports = roleSchema;
