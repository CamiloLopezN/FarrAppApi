const { Schema } = require('mongoose');

const dressCodeSchema = new Schema({
  dressCodeName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

module.exports = dressCodeSchema;
