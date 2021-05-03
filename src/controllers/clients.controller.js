const mongoose = require('../config/config.database');

const { Client, User, Establishment, Event } = require('../models/entity.model');
const { validatePass } = require('./password.controller');
const roles = require('../middlewares/oauth/roles');
const validation = require('../middlewares/validations/validation');
const { postClientVal, updateClientVal } = require('../middlewares/validations/client.joi');
const { establishmentId } = require('../middlewares/validations/establishment.joi');
const { eventId } = require('../middlewares/validations/event.joi');
const auth = require('../middlewares/oauth/authentication');
const { authorize } = require('../middlewares/oauth/authentication');
const { generatePasswordRand } = require('../utilities/generatePass');
const calculation = require('../utilities/calculations');
const { sendAccountValidator, sendCreatedUserByAdmin } = require('./utils');

const postClient = async (req, res) => {
  const { email, password, firstName, lastName, birthdate, gender } = req.body;
  const user = new User({
    email,
    password,
    role: roles.client,
    hasReqDeactivation: false,
    isActive: true,
    isVerified: false,
  });

  if (!password && !req.payload) return res.status(403).json({ message: 'Forbidden' });

  const passwordAux = password || generatePasswordRand(8, 'alf');
  user.password = await user.encryptPassword(passwordAux);

  const month = birthdate.split('-')[1] - 1;
  const myDate = new Date(birthdate.split('-')[0], month, birthdate.split('-')[2]);
  const client = new Client({
    // eslint-disable-next-line no-underscore-dangle
    userId: user._id,
    firstName,
    lastName,
    birthdate: myDate,
    gender,
  });

  try {
    const foundClient = await User.findOne({ email });
    if (!foundClient) {
      await client.save();
      await user.save();
    }
    sendAccountValidator(
      {
        email,
        username: firstName,
      },
      `${req.protocol}://${req.headers.host}/api/users/verify-account`,
    );

    if (!password) {
      sendCreatedUserByAdmin(email, firstName, passwordAux);
    }
  } catch (error) {
    // eslint-disable-next-line no-underscore-dangle
    await User.deleteOne({ _id: user._id });
    // eslint-disable-next-line no-underscore-dangle
    await Client.deleteOne({ _id: client._id });
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({
    message: 'Successful operation',
  });
};
module.exports.postClient = [
  authorize([roles.guest, roles.admin]),
  validation(postClientVal),
  validatePass,
  postClient,
];

const updateClientProfile = async (req, res) => {
  const { clientId } = req.params;
  const { birthdate, firstName, lastName, gender } = req.body;
  if (req.id !== clientId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  const month = birthdate.split('-')[1] - 1;
  const myDate = new Date(birthdate.split('-')[0], month, birthdate.split('-')[2]);
  const data = {
    $set: { birthdate: myDate, firstName, lastName, gender },
  };
  try {
    const update = await Client.findOneAndUpdate({ _id: req.id }, data);
    if (!update) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({ message: 'Successful update' });
};
module.exports.updateClientProfile = [
  auth.authentication,
  auth.authorizationClient,
  validation(updateClientVal),
  updateClientProfile,
];

const getClientById = async (req, res) => {
  const { clientId } = req.params;
  const id = auth.authorizationAdminOrClient(req, res, clientId);
  try {
    const doc = await Client.findOne({ _id: id }, { __v: 0 });
    if (!doc) return res.status(404).json({ message: 'Resource not found' });
    return res.status(200).json({ message: doc });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports.getClientById = [auth.authentication, getClientById];

const getClients = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  if (!req.payload.role === roles.admin) return res.status(403).json({ message: 'Forbidden' });
  const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };
  let clients;
  try {
    clients = await Client.paginate({}, { projection, limit, page });
    if (!clients) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({ message: clients });
};
module.exports.getClients = [auth.authentication, getClients];

const followEstablishment = async (req, res) => {
  const clientId = req.payload.roleId;

  const queryFind = { 'follows.establishmentId': req.body.establishmentId, _id: clientId };
  try {
    const follow = await Client.findOne(queryFind);

    if (!follow) {
      const establish = await Establishment.findOne({ _id: req.body.establishmentId }).orFail();
      const estPreview = {
        // eslint-disable-next-line no-underscore-dangle
        establishmentId: establish._id,
        companyId: establish.company.companyId,
        establishmentName: establish.establishmentName,
        location: establish.location,
        imageUrl: establish.photoUrls[0],
        isActive: establish.isActive,
      };
      await Client.updateOne({ _id: clientId }, { $push: { follows: estPreview } }).orFail();
      await calculation.sumFollower(req.body.establishmentId);
    } else {
      await Client.updateOne(queryFind, {
        $pull: { follows: { establishmentId: req.body.establishmentId } },
      }).orFail();
      await calculation.deductFollower(req.body.establishmentId);
    }
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({ message: 'Successful operation' });
};
module.exports.followEstablishment = [
  authorize([roles.client]),
  validation(establishmentId),
  followEstablishment,
];

const interestForEvent = async (req, res) => {
  const clientId = req.payload.roleId;

  const queryFind = { 'interests.eventId': req.body.eventId, _id: clientId };
  try {
    const interest = await Client.findOne(queryFind);
    if (!interest) {
      const event = await Event.findOne({ _id: req.body.eventId }).orFail();
      const est = await Establishment.findOne({
        _id: event.establishment.establishmentId,
      }).orFail();

      const eventPreview = {
        // eslint-disable-next-line no-underscore-dangle
        eventId: event._id,
        establishmentId: event.establishment.establishmentId,
        companyId: est.company.companyId,
        eventName: event.eventName,
        city: event.location.city,
        start: event.start,
        end: event.end,
        imageUrl: event.photoUrls[0],
        status: event.status,
        capacity: event.capacity,
        minAge: event.minAge,
        categories: event.categories,
        dressCodes: event.dressCodes,
      };
      await Client.updateOne({ _id: clientId }, { $push: { interests: eventPreview } }).orFail();
      await calculation.sumInterested(req.body.eventId);
    } else {
      await Client.updateOne(queryFind, {
        $pull: { interests: { eventId: req.body.eventId } },
      }).orFail();
      await calculation.deductInterested(req.body.eventId);
    }
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({ message: 'Successful operation' });
};

module.exports.interestForEvent = [
  authorize([roles.client]),
  validation(eventId),
  interestForEvent,
];
