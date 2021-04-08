const Joi = require('joi');

const companyValidation = {};

companyValidation.signUpVal = Joi.object({
  user: Joi.object({
    email: Joi.string()
      .email()
      .max(150)
      .regex(/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i)
      .required(),
    password: Joi.string().max(150).required(),
  }).required(),
  companyName: Joi.string().max(150).required(),
  address: Joi.string().max(150).required(),
  contactNumber: Joi.string().max(50).required(),
  nit: Joi.string().max(11).required(),
});

companyValidation.putCompany = Joi.object({
  companyName: Joi.string().max(150),
  address: Joi.string().max(150),
  contactNumber: Joi.string().max(50),
  nit: Joi.string().max(11),
});

module.exports = companyValidation;
