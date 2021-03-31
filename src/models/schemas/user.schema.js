const { Schema } = require('mongoose');

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    hasReqDeactivation: { type: Boolean },
    isActive: { type: Boolean },
  },
  { timestamps: true },
);

module.exports = userSchema;
