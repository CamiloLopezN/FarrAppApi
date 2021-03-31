const { Schema } = require('mongoose');

const reviewSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, required: true },
    authorName: { type: String, required: true },
    comment: { type: String },
    rating: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true },
);

module.exports = reviewSchema;
