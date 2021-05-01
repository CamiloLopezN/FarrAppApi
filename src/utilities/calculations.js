const calculation = {};
const { Establishment, Event } = require('../models/entity.model');

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
calculation.calculateAvgRatingEvent = async (eventId) => {
  const event = await Event.findOne({ _id: eventId }, { reviews: 1, _id: 0 }).orFail();
  const sum = event.reviews.reduce((accum, review) => accum + Number(review.rating), 0);
  const avg = sum / event.reviews.length;
  const data = { $set: { averageRating: avg } };
  await Event.updateOne({ _id: eventId }, data).orFail();
};
calculation.sumFollower = async (establishmentId) => {
  const establishment = await Establishment.findOne({ _id: establishmentId }).orFail();
  const foundFollowers = establishment.followers || 0;
  const followers = foundFollowers + 1;
  const data = { $set: { followers } };
  await Establishment.updateOne({ _id: establishmentId }, data).orFail();
};
calculation.deductFollower = async (establishmentId) => {
  const establishment = await Establishment.findOne({ _id: establishmentId }).orFail();
  const foundFollowers = establishment.followers || 0;
  const followers = foundFollowers - 1;
  const data = { $set: { followers } };
  await Establishment.updateOne({ _id: establishmentId }, data).orFail();
};
calculation.sumInterested = async (eventId) => {
  const event = await Event.findOne({ _id: eventId }).orFail();
  const foundInterested = event.interested || 0;
  const interested = foundInterested + 1;
  const data = { $set: { interested } };
  await Event.updateOne({ _id: eventId }, data).orFail();
};
calculation.deductInterested = async (eventId) => {
  const event = await Event.findOne({ _id: eventId }).orFail();
  const foundInterested = event.interested || 0;
  const interested = foundInterested - 1;
  const data = { $set: { interested } };
  await Event.updateOne({ _id: eventId }, data).orFail();
}
module.exports = calculation;
