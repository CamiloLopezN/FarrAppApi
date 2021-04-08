const Joi = require('joi');

const establishmentValidation = {};

establishmentValidation.postEstablishmentVal = Joi.object({
  establishmentName: Joi.string().max(150).required(),
  establishmentTypes: Joi.array()
    .items(
      Joi.object({
        establishmentTypeName: Joi.string().max(50).required(),
        description: Joi.string().max(150).required(),
      }),
    )
    .required(),
  categories: Joi.array().items(Joi.string()).max(50).required(),
  description: Joi.string().max(1024).required(),
  logoUrl: Joi.string().max(150).required(),
  photoUrls: Joi.array().items(Joi.string().max(200)).max(7).required(),
  capacity: Joi.number().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(150).required(),
    city: Joi.string().max(80).required(),
  }).required(),
});

module.exports = establishmentValidation;
