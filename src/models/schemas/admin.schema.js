const { Schema } = require('mongoose');

const adminSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'Users' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

module.exports = adminSchema;
