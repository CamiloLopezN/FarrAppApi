const Joi = require('joi');

const eventsValidations = {};

eventsValidations.postEventVal = Joi.object({
  eventName: Joi.string().max(150).required(),
  start: Joi.string().max(30).required(),
  end: Joi.string().max(30).required(),
  photoUrls: Joi.array().min(1).max(7).required(),
  categories: Joi.array().min(1).max(5),
  description: Joi.string().max(1024).required(),
  dressCodes: Joi.array().items(Joi.string()).max(5).required(),
  minAge: Joi.number().required(),
  status: Joi.string().max(50).required(),
  capacity: Joi.number().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(150).required(),
    city: Joi.string().max(80).required(),
  }).required(),
  tickets: Joi.array()
    .items(
      Joi.object({
        ticketName: Joi.string().max(150).required(),
        onlinePrice: Joi.number().required(),
        onDoorPrice: Joi.number().required(),
        isFastLine: Joi.boolean().required(),
        totalAvailable: Joi.number().required(),
        salesStart: Joi.string().max(30).required(),
        salesEnd: Joi.string().max(30).required(),
        description: Joi.string().max(1024).required(),
        status: Joi.string().max(20).required(),
        promotionalCodes: Joi.array().items(
          Joi.object({
            codeString: Joi.string(),
            remainingValidExchanges: Joi.number(),
            totalValidExchanges: Joi.number(),
            discountType: Joi.string(),
            discountRate: Joi.number(),
          }),
        ),
        maxPerPurchase: Joi.number(),
        minPerPurchase: Joi.number().required().min(1),
        isTransferable: Joi.boolean().required(),
        otherInfo: Joi.string().max(1024),
      }),
    )
    .required(),
});

module.exports = eventsValidations;
