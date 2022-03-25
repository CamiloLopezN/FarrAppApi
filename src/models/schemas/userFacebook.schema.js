const { Schema } = require("mongoose");

const userFacebookSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    hasReqDeactivation: { type: Boolean },
    isActive: { type: Boolean },
    isVerified: { type: Boolean }
  },
  { timestamps: true }
);

module.exports = userFacebookSchema;
