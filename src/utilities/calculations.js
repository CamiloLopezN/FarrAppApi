const calculation = {};
const { Establishment } = require('../models/entity.model');

calculation.calculateAvgRatingEstablishment = async (establishmentId) => {
  const establishment = await Establishment.findOne(
    { _id: establishmentId },
    { reviews: 1, _id: 0 },
  ).orFail();
  const sum = establishment.reviews.reduce((accum, review) => accum + Number(review.rating), 0);
  const avg = sum / establishment.reviews.length;
  const data = { $set: { averageRating: avg } };
  await Establishment.updateOne({ _id: establishmentId }, data).orFail();
};
module.exports = calculation;
