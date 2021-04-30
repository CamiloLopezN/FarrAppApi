const mongoose = require('mongoose');
const { Event, Client } = require('../models/entity.model');
const calculation = require('../utilities/calculations');
const { authentication, authorizationClient } = require('../middlewares/oauth/authentication');
const validation = require('../middlewares/validations/validation');
const { establishmentReview } = require('../middlewares/validations/establishment.joi');

module.exports.getAllEvents = async (req, res) => {
  let events;
  const projection = {
    _id: 1,
    eventName: 1,
    'location.city': 1,
    start: 1,
    end: 1,
    photoUrls: 1,
    status: 1,
  };
  try {
    events = await Event.find({ status: 'Activo' }, projection).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error`, err });
  }

  return res.status(200).json({ message: events });
};

const postReviewEvent = async (req, res) => {
  const clientId = req.id;
  const { eventId } = req.params;
  let eventReview;
  try {
    const client = await Client.findOne({ _id: clientId }).orFail();
    eventReview = {
      authorId: clientId,
      authorName: `${client.firstName} ${client.lastName}`,
      comment: req.body.comment,
      rating: req.body.rating,
      title: req.body.title,
    };
    await Event.updateOne({ _id: eventId }, { $push: { reviews: eventReview } }).orFail();
    await calculation.calculateAvgRatingEvent(eventId);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({ message: eventReview });
};

module.exports.postReviewEvent = [
  authentication,
  authorizationClient,
  validation(establishmentReview),
  postReviewEvent,
];
