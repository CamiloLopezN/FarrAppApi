const Joi = require('joi');

const establishmentValidation = {};

establishmentValidation.postEstablishmentVal = Joi.object({
  establishmentName: Joi.string().max(150).required(),
  establishmentTypes: Joi.array().items(Joi.string()).max(20).required(),
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

establishmentValidation.establishmentPreview = Joi.object({
  establishmentId: Joi.string().max(30).required(),
  establishmentName: Joi.string().max(150).required(),
  city: Joi.string().max(80).required(),
  address: Joi.string().max(150).required(),
  imageUrl: Joi.string().required(),
  isActive: Joi.boolean().required(),
});

establishmentValidation.establishmentId = Joi.object({
  establishmentId: Joi.string().max(30).required(),
});

establishmentValidation.updateEstablishmentVal = Joi.object({
  establishmentName: Joi.string().max(150),
  establishmentTypes: Joi.array().items(Joi.string()).max(20).required(),
  categories: Joi.array().items(Joi.string()).max(50),
  description: Joi.string().max(1024),
  logoUrl: Joi.string().max(150),
  isActive: Joi.boolean(),
  photoUrls: Joi.array().items(Joi.string().max(200)).max(7),
  capacity: Joi.number(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    address: Joi.string().max(150),
    city: Joi.string().max(80),
  }),
});

module.exports = establishmentValidation;
