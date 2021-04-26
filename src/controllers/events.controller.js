const mongoose = require('mongoose');
const { Event } = require('../models/entity.model');

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
    return res.status(500).json({ message: `Internal server error`, err });
  }

  return res.status(200).json({ message: events });
};
