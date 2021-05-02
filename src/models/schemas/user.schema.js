const { Schema } = require('mongoose');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    hasReqDeactivation: { type: Boolean },
    isActive: { type: Boolean },
    isVerified: { type: Boolean },
  },
  { timestamps: true },
);

userSchema.methods.encryptPassword = async (password) =>
  bcrypt.hash(password, await bcrypt.genSalt(10));

userSchema.methods.matchPassword = (password) => bcrypt.compare(password, this.password);

userSchema.plugin(uniqueValidator);
module.exports = userSchema;
