const mongoose = require('../config/config.database');

const { Establishment, Client, Company } = require('../models/entity.model');
const validation = require('../middlewares/validations/validation');
const { establishmentReview } = require('../middlewares/validations/establishment.joi');
const calculation = require('../utilities/calculations');
const roles = require('../middlewares/oauth/roles');
const { authorize } = require('../middlewares/oauth/authentication');

const postReviewEstablishment = async (req, res) => {
  const clientId = req.payload.roleId;
  const { establishmentId } = req.params;
  let estReview;
  let createdReview;
  let updatedEstab;
  try {
    const client = await Client.findOne({ _id: clientId }).orFail();
    estReview = {
      authorId: clientId,
      authorName: `${client.firstName} ${client.lastName}`,
      comment: req.body.comment,
      rating: req.body.rating,
      title: req.body.title,
    };
    updatedEstab = await Establishment.findOneAndUpdate(
      { _id: establishmentId },
      { $push: { reviews: estReview } },
      { new: true },
    ).orFail();
    createdReview = updatedEstab.reviews.pop();
    await calculation.calculateAvgRatingEstablishment(establishmentId);
    updatedEstab = await Establishment.findOne({ _id: establishmentId }).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(201).json({ createdReview, averageRating: updatedEstab.averageRating });
};
module.exports.postReviewEstablishment = [
  authorize([roles.client]),
  validation(establishmentReview),
  postReviewEstablishment,
];

const getEstablishmentLandingPage = async (req, res) => {
  let establishments;
  try {
    establishments = await Company.aggregate([
      { $unwind: '$establishments' },
      { $match: { 'establishments.isActive': true } },
      { $project: { establishments: 1 } },
      {
        $facet: {
          metadata: [{ $count: 'Establishments' }],
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

  return res.status(200).json(establishments);
};
module.exports.getEstablishmentLandingPage = [getEstablishmentLandingPage];
