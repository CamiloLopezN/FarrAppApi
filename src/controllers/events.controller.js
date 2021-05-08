const mongoose = require('mongoose');
const { Company, Client, Event } = require('../models/entity.model');
const { authorize } = require('../middlewares/oauth/authentication');
const validation = require('../middlewares/validations/validation');
const { establishmentReview } = require('../middlewares/validations/establishment.joi');
const roles = require('../middlewares/oauth/roles');

const getEventsLandingPage = async (req, res) => {
  let events;
  try {
    events = await Company.aggregate([
      { $unwind: '$events' },
      { $match: { 'events.status': 'Activo' } },
      { $sort: { 'events.start': 1 } },
      { $project: { events: 1 } },
      {
        $facet: {
          metadata: [{ $count: 'Events' }],
          data: [{ $limit: 10 }],
        },
      },
    ]);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }

  return res.status(200).json(events);
};

module.exports.getEventsLandingPage = [getEventsLandingPage];

const postReviewEvent = async (req, res) => {
  const clientId = req.payload.roleId;
  const { eventId } = req.params;
  let eventReview;
  let createdReview;
  let updatedEvent;
  try {
    const client = await Client.findOne({ _id: clientId }).orFail();
    eventReview = {
      authorId: clientId,
      authorName: `${client.firstName} ${client.lastName}`,
      comment: req.body.comment,
      rating: req.body.rating,
      title: req.body.title,
    };
    updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId },
      { $push: { reviews: eventReview } },
      { new: true },
    ).orFail();

    updatedEvent.calculateAvgRating();
    updatedEvent.save();
    createdReview = updatedEvent.reviews[updatedEvent.reviews.length - 1];
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data', err });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(201).json({ createdReview, averageRating: updatedEvent.averageRating });
};

module.exports.postReviewEvent = [
  authorize([roles.client]),
  validation(establishmentReview),
  postReviewEvent,
];
