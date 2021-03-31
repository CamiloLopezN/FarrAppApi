const { Schema } = require('mongoose');

const userSchema = require('./user.schema');

const adminSchema = new Schema({
  user: { type: userSchema, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

module.exports = adminSchema;
