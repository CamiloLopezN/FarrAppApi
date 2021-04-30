const mongoose = require('../config/config.database');

const { Establishment, Client } = require('../models/entity.model');
const validation = require('../middlewares/validations/validation');
const { establishmentReview } = require('../middlewares/validations/establishment.joi');
const calculation = require('../utilities/calculations');
const { authentication, authorizationClient } = require('../middlewares/oauth/authentication');

const postReviewEstablishment = async (req, res) => {
  const clientId = req.id;
  const { establishmentId } = req.params;

  try {
    const client = await Client.findOne({ _id: clientId }).orFail();
    const estReview = {
      authorId: clientId,
      authorName: `${client.firstName} ${client.lastName}`,
      comment: req.body.comment,
      rating: req.body.rating,
      title: req.body.title,
    };
    await Establishment.updateOne(
      { _id: establishmentId },
      { $push: { reviews: estReview } },
    ).orFail();
    await calculation.calculateAvgRatingEstablishment(establishmentId);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({ message: 'Successful operation' });
};
module.exports.postReviewEstablishment = [
  authentication,
  authorizationClient,
  validation(establishmentReview),
  postReviewEstablishment,
];
