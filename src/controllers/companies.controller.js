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
const {
  authentication,
  authorizationCompany,
  authorize,
} = require('../middlewares/oauth/authentication');
const {
  sendAccountValidator,
  sendEmailRegisterCompany,
  sendCreatedUserByAdmin,
} = require('./utils');

/*
Registrar una compañia
 */
async function signUp(req, res) {
  const { email, password, companyName, address, contactNumber, nit } = req.body;
  if (!password && !req.payload) return res.status(403).json({ message: 'Forbidden' });
  const user = new User({
    email,
    password,
    hasReqDeactivation: false,
    isActive: false,
    role: roles.company,
    isVerified: false,
  });

  if (req.payload) {
    user.isActive = true;
  }

  const passwordAux = password || generatePasswordRand(8, 'alf');
  user.password = await user.encryptPassword(passwordAux);

  const company = new Company({
    companyName,
    address,
    contactNumber,
    nit,
    // eslint-disable-next-line no-underscore-dangle
    userId: user._id,
  });

  try {
    const foundCompany = await User.findOne({ email });
    if (!foundCompany) {
      await company.save();
      await user.save();
    }
    sendAccountValidator(
      {
        email,
        username: companyName,
      },
      `${req.protocol}://${req.headers.host}/api/users/verify-account`,
    );
    if (!req.payload) {
      sendEmailRegisterCompany(email, companyName);
    }

    if (req.payload && !password) {
      sendCreatedUserByAdmin(email, companyName, passwordAux);
    }
  } catch (err) {
    // eslint-disable-next-line no-underscore-dangle
    await User.deleteOne({ _id: user._id });
    // eslint-disable-next-line no-underscore-dangle
    await Company.deleteOne({ _id: company._id });
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({
    message: 'Successful operation',
  });
}

module.exports.signUp = [
  authentication,
  authorize([roles.guest, roles.admin]),
  validation(signUpVal),
  signUp,
];

/*
Un admin obtiene la información de las compañias
 */
async function getCompanies(req, res) {
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
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: companies });
}
module.exports.getCompanies = [authentication, authorize([roles.admin]), getCompanies];

/*
Un usuario admin o company con los permisos solicita toda la información de un compañia
 */
async function getCompanyById(req, res) {
  const { companyId } = req.params;
  if (req.payload.role === roles.company && req.payload.roleId !== companyId)
    return res.status(401).json({ message: 'Unauthorized' });

  try {
    const doc = await Company.findOne({ _id: companyId }, { __v: 0 });
    if (!doc) return res.status(404).json({ message: 'Resource not found' });

    return res.status(200).json({ message: doc });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error` });
  }
}

module.exports.profile = [authentication, authorize([roles.company, roles.admin]), getCompanyById];

/*
Actualizar la información del perfil
 */
async function updateProfile(req, res) {
  const { companyId } = req.params;
  if (req.payload.role === roles.company && req.payload.roleId !== companyId)
    return res.status(401).json({ message: 'Unauthorized' });

  const { body } = req;
  const data = {
    $set: body,
  };

  try {
    const update = await Company.findOneAndUpdate({ _id: companyId }, data, {
      runValidators: true,
      context: 'query',
    });
    if (!update) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({
        message: 'Incomplete or bad formatted client data',
        errors: err.errors,
      });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: 'Successful update' });
}

module.exports.updateProfile = [
  authentication,
  authorize([roles.company, roles.admin]),
  validation(updateCompany),
  updateProfile,
];

async function registerEstablishment(req, res) {
  const { companyId } = req.params;
  if (companyId && companyId !== req.payload.roleId)
    return res.status(401).json({ message: 'Unauthorized' });
  let establishmentId;
  try {
    const company = await Company.findOne({ _id: companyId }, { _id: 1, companyName: 1 }).orFail();
    const establishment = new Establishment(req.body);
    establishment.isActive = true;
    establishment.averageRating = 0;
    establishment.followers = 0;
    establishment.company = {
      // eslint-disable-next-line no-underscore-dangle
      companyId: company._id,
      companyName: company.companyName,
    };
    const establishmentSaved = await establishment.save();
    const previewEstablishment = {
      // eslint-disable-next-line no-underscore-dangle
      establishmentId: establishmentSaved._id,
      companyId,
      establishmentName: establishmentSaved.establishmentName,
      location: establishmentSaved.location,
      imageUrl: establishmentSaved.photoUrls[0],
      isActive: establishmentSaved.isActive,
    };

    await Company.updateOne(
      { _id: companyId },
      { $push: { establishments: previewEstablishment } },
    );
    establishmentId = previewEstablishment.establishmentId;
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: 'Successful registration', establishmentId });
}

module.exports.registerEstablishment = [
  authentication,
  authorize([roles.company]),
  validation(postEstablishmentVal),
  registerEstablishment,
];

async function getPreviewEstablishmentsOfCompany(req, res) {
  const { companyId } = req.params;
  if (req.payload.role === roles.company && req.payload.roleId !== companyId)
    return res.status(401).json({ message: 'Unauthorized' });
  let establishments;

  try {
    establishments = await Company.findOne({ _id: companyId }, { establishments: 1, _id: 0 });
    if (!establishments) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: establishments });
}

module.exports.getPreviewEstablishmentsOfCompany = [
  authorize([roles.company, roles.admin]),
  getPreviewEstablishmentsOfCompany,
];

async function getEstablishmentById(req, res) {
  const { companyId, establishmentId } = req.params;

  if (req.payload) {
    if (req.payload.role === roles.company && companyId !== req.payload.roleId)
      return res.status(401).json({ message: 'Unauthorized' });
  }
  let establishment;
  try {
    establishment = await Establishment.findOne({ _id: establishmentId }, { __v: 0 }).orFail();
    if (!establishment) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: establishment });
}

module.exports.getEstablishmentById = [
  authorize([roles.company, roles.guest]),
  getEstablishmentById,
];

async function updateEstablishmentById(req, res) {
  const { companyId, establishmentId } = req.params;
  if (companyId !== req.payload.roleId) return res.status(401).json({ message: 'Unauthorized' });

  const { body } = req;
  const data = {
    $set: body,
  };

  try {
    const updated = await Establishment.findOneAndUpdate(
      { _id: establishmentId, 'company.companyId': mongoose.Types.ObjectId(companyId) },
      data,
    ).orFail();

    const establishmentUpdated = await Establishment.findOne({ _id: establishmentId }).orFail();

    const establishmentPreview = {
      // eslint-disable-next-line no-underscore-dangle
      establishmentId: establishmentUpdated._id,
      establishmentName: establishmentUpdated.establishmentName,
      location: establishmentUpdated.location,
      address: establishmentUpdated.location.address,
      imageUrl: establishmentUpdated.photoUrls[0],
      isActive: establishmentUpdated.isActive,
    };

    await Company.updateOne(
      // eslint-disable-next-line no-underscore-dangle
      { _id: companyId, 'establishments.establishmentId': updated._id },
      { $set: { 'establishments.$': establishmentPreview } },
    ).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }

  return res.status(200).json({ message: 'Update complete' });
}

module.exports.updateEstablishmentById = [
  authorize([roles.company]),
  validation(updateEstablishmentVal),
  updateEstablishmentById,
];

async function deleteEstablishmentById(req, res) {
  const { companyId, establishmentId } = req.params;
  if (companyId !== req.payload.roleId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const events = await Event.find({
      'establishment.establishmentId': { $eq: mongoose.Types.ObjectId(establishmentId) },
    });

    if (events.length > 0) {
      await Event.deleteMany({
        'establishment.establishmentId': { $eq: mongoose.Types.ObjectId(establishmentId) },
      }).orFail();
    }

    await Establishment.deleteOne({
      $and: [
        { _id: { $eq: establishmentId } },
        { 'company.companyId': { $eq: mongoose.Types.ObjectId(companyId) } },
      ],
    }).orFail();

    await Company.updateMany(
      {
        _id: companyId,
      },
      {
        $pull: {
          establishments: { establishmentId: { $eq: mongoose.Types.ObjectId(establishmentId) } },
        },
      },
    ).orFail();

    await Company.updateMany(
      {
        _id: companyId,
      },
      {
        $pull: {
          events: { establishmentId: { $eq: mongoose.Types.ObjectId(establishmentId) } },
        },
      },
    );
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });

    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });

    return res.status(500).json({ message: `Internal server error`, err });
  }
  return res.status(200).json({ message: 'Deleted establishment' });
}

module.exports.deleteEstablishmentById = [authorize([roles.company]), deleteEstablishmentById];

async function registerEvent(req, res) {
  const { companyId, establishmentId } = req.params;
  if (!companyId || !establishmentId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

  if (companyId !== req.payload.roleId) return res.status(401).json({ message: 'Unauthorized' });
  let eventId;
  try {
    const establishmentSearch = await Establishment.findOne(
      { _id: establishmentId, 'company.companyId': mongoose.Types.ObjectId(companyId) },
      { establishmentName: 1, _id: 1 },
    ).orFail();
    const event = new Event(req.body);
    event.establishment = {
      // eslint-disable-next-line no-underscore-dangle
      establishmentId: establishmentSearch._id,
      establishmentName: establishmentSearch.establishmentName,
    };
    event.status = 'Inactivo';
    event.interested = 0;
    event.averageRating = 0;
    const eventSaved = await event.save();
    const eventPreview = {
      // eslint-disable-next-line no-underscore-dangle
      eventId: eventSaved._id,
      establishmentId,
      companyId,
      eventName: event.eventName,
      city: event.location.city,
      start: event.start,
      end: event.end,
      imageUrl: event.photoUrls[0],
      capacity: event.capacity,
      minAge: event.minAge,
      categories: event.categories,
      dressCodes: event.dressCodes,
      status: event.status,
    };
    await Establishment.updateOne(
      { _id: establishmentId },
      { $push: { events: eventPreview } },
    ).orFail();
    await Company.updateOne({ _id: companyId }, { $push: { events: eventPreview } }).orFail();
    eventId = eventPreview.eventId;
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: 'Successful registration', eventId });
}

module.exports.registerEvent = [
  authorize([roles.company]),
  validation(postEventVal),
  registerEvent,
];

async function getEventsByEstablishment(req, res) {
  const { companyId, establishmentId } = req.params;
  if (!companyId || !establishmentId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });

  if (companyId !== req.payload.roleId) return res.status(401).json({ message: 'Unauthorized' });
  let events;
  try {
    await Establishment.findOne({
      $and: [
        { _id: { $eq: establishmentId } },
        { 'company.companyId': { $eq: mongoose.Types.ObjectId(companyId) } },
      ],
    }).orFail();

    events = await Event.find({
      'establishment.establishmentId': mongoose.Types.ObjectId(establishmentId),
    }).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: events });
}

module.exports.getEventsByEstablishment = [authorize([roles.company]), getEventsByEstablishment];

async function getEventById(req, res) {
  const { companyId, establishmentId, eventId } = req.params;
  if (!companyId || !establishmentId || !eventId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  let event;
  try {
    if (req.payload) {
      if (req.payload.role === roles.company) {
        if (companyId !== req.payload.roleId)
          return res.status(401).json({ message: 'Unauthorized' });
      }
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
    } else {
      event = await Event.findOne({ _id: eventId }, { 'tickets.promotionalCodes': 0 }).orFail();
    }
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: event });
}

module.exports.getEventbyId = [
  authorize([roles.guest, roles.company, roles.admin, roles.client]),
  getEventById,
];

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

    await Event.findOneAndUpdate({ _id: eventId }, data).orFail();

    const eventUpdated = await Event.findOne(
      { _id: eventId },
      {
        _id: 1,
        eventName: 1,
        'location.city': 1,
        start: 1,
        end: 1,
        photoUrls: 1,
        status: 1,
        capacity: 1,
        minAge: 1,
        categories: 1,
        dressCodes: 1,
      },
    ).orFail();
    const eventPreview = {
      // eslint-disable-next-line no-underscore-dangle
      eventId: eventUpdated._id,
      establishmentId,
      companyId,
      eventName: eventUpdated.eventName,
      city: eventUpdated.location.city,
      start: eventUpdated.start,
      end: eventUpdated.end,
      imageUrl: eventUpdated.photoUrls[0],
      capacity: eventUpdated.capacity,
      minAge: eventUpdated.minAge,
      categories: eventUpdated.categories,
      dressCodes: eventUpdated.dressCodes,
      status: eventUpdated.status,
    };
    await Establishment.updateOne(
      { _id: establishmentId, 'events.eventId': eventPreview.eventId },
      { $set: { 'events.$': eventPreview } },
    ).orFail();
    await Company.updateOne(
      { _id: companyId, 'events.eventId': eventPreview.eventId },
      { $set: { 'events.$': eventPreview } },
    ).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });

    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }

  return res.status(200).json({ message: 'Update complete' });
}

async function deleteEventById(req, res) {
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

    await Event.deleteOne({ _id: eventId }).orFail();

    await Company.updateMany(
      {
        _id: companyId,
      },
      {
        $pull: {
          events: { eventId: { $eq: mongoose.Types.ObjectId(eventId) } },
        },
      },
    ).orFail();

    await Establishment.updateMany(
      {
        $and: [
          { _id: { $eq: establishmentId } },
          { 'company.companyId': { $eq: mongoose.Types.ObjectId(companyId) } },
        ],
      },
      {
        $pull: {
          events: { eventId: { $eq: mongoose.Types.ObjectId(eventId) } },
        },
      },
    ).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });

    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error` });
  }

  return res.status(200).json({ message: 'Deleted event' });
}

module.exports.deleteEventById = [authentication, authorizationCompany, deleteEventById];

module.exports.updateEvent = [
  authentication,
  authorizationCompany,
  validation(updateEventVal),
  updateEvent,
];

async function getEventsByCompany(req, res) {
  const { companyId } = req.params;
  if (!companyId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  if (companyId !== req.id) return res.status(403).json({ message: 'Forbidden' });

  let events;
  try {
    events = await Company.findOne(
      {
        _id: mongoose.Types.ObjectId(companyId),
      },
      { events: 1, _id: 0 },
    ).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    return res.status(500).json({ message: `Internal server error`, err });
  }

  return res.status(200).json({ message: events });
}

module.exports.getEventsByCompany = [authentication, authorizationCompany, getEventsByCompany];
