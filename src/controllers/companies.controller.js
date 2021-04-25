const companyCtrl = {};
const mongoose = require('../config/config.database');

const { Company, Establishment, User, Event } = require('../models/entity.model');
const {
  postEstablishmentVal,
  updateEstablishmentVal,
} = require('../middlewares/validations/establishment.joi');
const { signUpVal, updateCompany } = require('../middlewares/validations/company.joi');
const { postEventVal, updateEventVal } = require('../middlewares/validations/event.joi');
const validation = require('../middlewares/validations/validation');
const { generatePasswordRand } = require('../utilities/generatePass');
const roles = require('../middlewares/oauth/roles');
const { authorizationAdminOrCompany } = require('../middlewares/oauth/authentication');

/*
Registrar una compañia
 */
async function signUp(req, res) {
  const { email, password, companyName, address, contactNumber, nit } = req.body;
  let generatePass;
  /* try { */
  const user = new User({
    email,
    password,
    hasReqDeactivation: false,
    isActive: false,
    role: roles.company,
    isVerified: false,
  });

  if (password) {
    user.password = await user.encryptPassword(password);
  } else {
    generatePass = generatePasswordRand(8, 'alf');
    user.password = await user.encryptPassword(generatePass);
  }

  await user
    .save()
    .then(async (savedUser) => {
      const company = new Company({
        companyName,
        address,
        contactNumber,
        nit,
        // eslint-disable-next-line no-underscore-dangle
        userId: savedUser._id,
      });
      await company
        .save()
        .then(() => {
          return res.status(200).json({ message: 'Successful registration' });
        })
        .catch(async (err) => {
          if (err instanceof mongoose.Error.ValidationError) {
            // eslint-disable-next-line no-underscore-dangle
            await User.remove({ _id: savedUser._id });
            return res.status(400).json({ message: err });
          }
          return res.status(400).json({ message: err });
        });
    })
    .catch((err) => {
      return res.status(400).json({ message: err });
    });
}

companyCtrl.signUp = [validation(signUpVal), signUp];

/*
Un admin obtiene la información de las compañias
 */
async function getCompanies(req, res) {
  if (!req.payload.role === roles.admin) return res.status(403).json({ message: 'Forbidden' });

  const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  let companies;
  try {
    companies = await Company.find({}, projection);
    if (!companies) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error  ${err}` });
  }
  return res.status(200).json({ message: companies });
}
companyCtrl.getCompanies = [getCompanies];

/*
Un usuario admin o company con los permisos solicita toda la información de un compañia
 */
async function getCompanyById(req, res) {
  const { companyId } = req.params;
  const id = authorizationAdminOrCompany(req, res, companyId);

  try {
    const doc = await Company.findOne({ _id: id }, { __v: 0 });
    if (!doc) return res.status(404).json({ message: 'Resource not found' });

    return res.status(200).json({ message: doc });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error  ${err}` });
  }
}

companyCtrl.profile = [getCompanyById];

/*
Actualizar la información del perfil
 */
async function updateProfile(req, res) {
  const { companyId } = req.params;
  if (req.id !== companyId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

  const { body } = req;
  const data = {
    $set: body,
  };

  try {
    const update = await Company.findOneAndUpdate({ _id: req.id }, data);
    if (!update) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error  ${err}` });
  }

  return res.status(200).json({ message: 'Successful update' });
}

companyCtrl.updateProfile = [validation(updateCompany), updateProfile];

async function registerEstablishment(req, res) {
  const { companyId } = req.params;
  if (companyId && companyId !== req.id)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  try {
    const establishment = new Establishment(req.body);
    const company = await Company.findOne({ _id: req.id }, { _id: 1, companyName: 1 }).orFail();
    establishment.isActive = true;
    establishment.averageRating = 0;
    establishment.company = {
      // eslint-disable-next-line no-underscore-dangle
      companyId: company._id,
      companyName: company.companyName,
    };
    const establishmentSaved = await establishment.save();
    const reviewEstablishment = {
      // eslint-disable-next-line no-underscore-dangle
      establishmentId: establishmentSaved._id,
      establishmentName: establishmentSaved.establishmentName,
      city: establishmentSaved.location.city,
      address: establishmentSaved.location.address,
      imageUrl: establishmentSaved.photoUrls[0],
      isActive: establishmentSaved.isActive,
    };

    await Company.updateOne({ _id: companyId }, { $push: { establishments: reviewEstablishment } });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error  ${err}` });
  }
  return res.status(200).json({ message: 'Successful registration' });
}

companyCtrl.registerEstablishment = [validation(postEstablishmentVal), registerEstablishment];

async function establishmentsOfCompany(req, res) {
  const { companyId } = req.params;
  const id = authorizationAdminOrCompany(req, res, companyId);
  let establishments;

  try {
    establishments = await Company.findOne({ _id: id }, { establishments: 1, _id: 0 });
    if (!establishments) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error  ${err}` });
  }
  return res.status(200).json({ message: establishments });
}

companyCtrl.establishmentsOfCompany = [establishmentsOfCompany];

async function getEstablishmentById(req, res) {
  const { companyId, establishmentId } = req.params;
  if (companyId !== req.id)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

  let establishment;
  try {
    establishment = await Establishment.findOne({ _id: establishmentId }, { __v: 0 });
    if (!establishment) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error  ${err}` });
  }

  return res.status(200).json({ message: establishment });
}

companyCtrl.getEstablishmentById = [getEstablishmentById];

async function updateEstablishmentById(req, res) {
  const { companyId, establishmentId } = req.params;
  if (companyId !== req.id)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

  const { body } = req;
  const data = {
    $set: body,
  };

  try {
    const updated = await Establishment.findOneAndUpdate({ _id: establishmentId }, data);
    if (!updated) return res.status(404).json({ message: 'Resource not found' });

    const establishmentUpdated = await Establishment.findOne({ _id: establishmentId }).orFail();

    const establishmentPreview = {
      // eslint-disable-next-line no-underscore-dangle
      establishmentId: establishmentUpdated._id,
      establishmentName: establishmentUpdated.establishmentName,
      city: establishmentUpdated.location.city,
      address: establishmentUpdated.location.address,
      imageUrl: establishmentUpdated.photoUrls[0],
      isActive: establishmentUpdated.isActive,
    };

    await Company.updateOne(
      // eslint-disable-next-line no-underscore-dangle
      { _id: companyId, 'establishments.establishmentId': updated._id },
      { $set: { 'establishments.$': establishmentPreview } },
    );
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error`, err });
  }

  return res.status(200).json({ message: 'Update complete' });
}

companyCtrl.updateEstablishmentById = [validation(updateEstablishmentVal), updateEstablishmentById];

async function registerEvent(req, res) {
  const { companyId, establishmentId } = req.params;
  if (!companyId || !establishmentId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  if (companyId !== req.id) return res.status(403).json({ message: 'Forbidden' });

  try {
    const establishmentSearch = await Establishment.findOne(
      { _id: establishmentId },
      { establishmentName: 1, _id: 1 },
    ).orFail();
    const event = new Event(req.body);
    const establishment = {
      // eslint-disable-next-line no-underscore-dangle
      establishmentId: establishmentSearch._id,
      establishmentName: establishmentSearch.establishmentName,
    };

    event.establishment = establishment;
    event.status = 'Inactivo';
    const eventSaved = await event.save();
    const eventPreview = {
      // eslint-disable-next-line no-underscore-dangle
      eventId: eventSaved._id,
      eventName: event.eventName,
      city: event.location.city,
      start: event.start,
      end: event.end,
      imageUrl: event.photoUrls[0],
      status: event.status,
    };
    await Establishment.updateOne({ _id: establishmentId }, { $push: { events: eventPreview } });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error`, err });
  }
  return res.status(200).json({ message: 'Successful registration' });
}

companyCtrl.registerEvent = [validation(postEventVal), registerEvent];

async function getEventsByEstablishment(req, res) {
  const { companyId, establishmentId } = req.params;
  if (!companyId || !establishmentId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  if (companyId !== req.id) return res.status(403).json({ message: 'Forbidden' });
  let events;
  try {
    const establishment = await Establishment.findOne({
      $and: [
        { _id: { $eq: establishmentId } },
        { 'company.companyId': { $eq: mongoose.Types.ObjectId(companyId) } },
      ],
    });

    if (!establishment)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

    events = await Event.find({
      'establishment.establishmentId': mongoose.Types.ObjectId(establishmentId),
    }).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error`, err });
  }
  return res.status(200).json({ message: events });
}

companyCtrl.getEventsByEstablishment = [getEventsByEstablishment];

async function getEventById(req, res) {
  const { companyId, establishmentId, eventId } = req.params;
  if (!companyId || !establishmentId || !eventId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  if (companyId !== req.id) return res.status(403).json({ message: 'Forbidden' });
  let event;
  try {
    const establishment = await Establishment.findOne({
      $and: [
        { _id: { $eq: establishmentId } },
        { 'company.companyId': { $eq: mongoose.Types.ObjectId(companyId) } },
        { 'events.eventId': { $in: [eventId] } },
      ],
    });

    if (!establishment)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

    event = await Event.findOne({ _id: eventId }).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error`, err });
  }

  return res.status(200).json({ message: event });
}

companyCtrl.getEventbyId = [getEventById];

async function updateEvent(req, res) {
  const { companyId, establishmentId, eventId } = req.params;
  if (!companyId || !establishmentId || !eventId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  if (companyId !== req.id) return res.status(403).json({ message: 'Forbidden' });

  try {
    const establishment = await Establishment.findOne({
      $and: [
        { _id: { $eq: establishmentId } },
        { 'company.companyId': { $eq: mongoose.Types.ObjectId(companyId) } },
        { 'events.eventId': { $in: [eventId] } },
      ],
    });

    if (!establishment)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

    const { body } = req;
    body.status = body.status[0].toUpperCase() + body.status.slice(1);
    const data = {
      $set: body,
    };

    const updated = await Event.findOneAndUpdate({ _id: eventId }, data);
    if (!updated) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error`, err });
  }

  const eventUpdated = await Event.findOne(
    { _id: eventId },
    { _id: 1, eventName: 1, 'location.city': 1, start: 1, end: 1, photoUrls: 1, status: 1 },
  );

  const eventPreview = {
    // eslint-disable-next-line no-underscore-dangle
    eventId: eventUpdated._id,
    eventName: eventUpdated.eventName,
    city: eventUpdated.location.city,
    start: eventUpdated.start,
    end: eventUpdated.end,
    imageUrl: eventUpdated.photoUrls[0],
    status: eventUpdated.status,
  };
  await Establishment.updateOne(
    { _id: establishmentId, 'events.eventId': eventPreview.eventId },
    { $set: { 'events.$': eventPreview } },
  );
  return res.status(200).json({ message: 'Update complete' });
}

companyCtrl.updateEvent = [validation(updateEventVal), updateEvent];

async function getEventsByCompany(req, res) {
  const { companyId } = req.params;
  if (!companyId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  if (companyId !== req.id) return res.status(403).json({ message: 'Forbidden' });

  let events;
  try {
    events = await Establishment.findOne(
      {
        'company.companyId': mongoose.Types.ObjectId(companyId),
      },
      { events: 1, _id: 0 },
    ).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error`, err });
  }

  return res.status(200).json({ message: events });
}

companyCtrl.getEventsByCompany = [getEventsByCompany];

module.exports = companyCtrl;
