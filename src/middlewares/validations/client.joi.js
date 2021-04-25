const Joi = require('joi');

const clientValidation = {};

clientValidation.postClientVal = Joi.object({
  email: Joi.string()
    .email()
    .max(150)
    .regex(/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i)
    .required(),
  password: Joi.string().max(150).required(),
  firstName: Joi.string().max(30).required(),
  lastName: Joi.string().max(30).required(),
  birthdate: Joi.string().max(30).required(),
  gender: Joi.string().max(10).required(),
});
module.exports = clientValidation;
