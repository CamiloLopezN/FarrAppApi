const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Company, Admin, Client } = require('../models/entity.model');
const { generateToken } = require('../middlewares/oauth/authentication');
const roles = require('../middlewares/oauth/roles');
const utils = require('./utils');
const { generatePasswordRand } = require('../utilities/generatePass');
const { authorize } = require('../middlewares/oauth/authentication');
const { validatePass } = require('./password.controller');

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  let token;
  const payload = {};
  const userInfo = {};
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: 'Incomplete or bad formatted data' });

    if (!user.isActive) return res.status(403).send({ message: 'Forbidden' });

    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: 'Wrong or no authentication email/password provided' });
    }

    if (!user.isVerified) return res.status(403).send({ message: 'Email is not verified' });

    if (user.role === roles.company) {
      const company = await Company.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, companyName: 1, customerId: 1 },
      );
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = company._id;
      payload.customerId = company.customerId;
      payload.role = roles.company;
      userInfo.firstName = company.companyName;
    } else if (user.role === roles.admin) {
      // eslint-disable-next-line no-underscore-dangle
      const admin = await Admin.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, firstName: 1, lastName: 1 },
      );
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = admin._id;
      payload.role = roles.admin;
      userInfo.firstName = admin.firstName;
      userInfo.lastName = admin.lastName;
    } else {
      // eslint-disable-next-line no-underscore-dangle
      const client = await Client.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, firstName: 1, lastName: 1 },
      );
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = client._id;
      payload.role = roles.client;
      userInfo.firstName = client.firstName;
      userInfo.lastName = client.lastName;
    }

    // eslint-disable-next-line no-underscore-dangle
    payload.userId = user._id;
    token = await generateToken(payload);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }
  return res.status(200).json({ token, userInfo });
};

const reqDeactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.payload.userId !== userId)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    const data = {
      $set: {
        hasReqDeactivation: true,
      },
    };
    const update = await User.findOneAndUpdate({ _id: userId }, data);
    if (!update) return res.status(404).json({ message: 'Resource not found' });
    return res.status(200).json({ message: 'Operación realizada satisfactoriamente!' });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};
module.exports.reqDeactivateUser = [
  authorize([roles.admin, roles.client, roles.company]),
  reqDeactivateUser,
];

// eslint-disable-next-line consistent-return
const recoverPassword = async (req, res) => {
  const { email } = req.body;
  const foundUser = await User.findOne({ email });

  if (!foundUser)
    return res.status(404).json({
      message: 'Se produjo un error, el correo ingresado no se encuentra registrado',
    });
  if (!foundUser.isActive)
    return res.status(403).json({ message: 'Esta cuenta se encuentra desactivada.' });
  if (foundUser.hasReqDeactivation)
    return res
      .status(403)
      .json({ message: 'Esta cuenta se encuentra en proceso de desativación.' });

  const password = generatePasswordRand(8, 'alf');
  const data = { $set: { password } };
  data.password = await foundUser.encryptPassword(password);
  await User.updateOne({ email }, data, (err) => {
    if (err) return res.status(500).json({ message: 'Se produjo un problema en la operación.' });
    utils.sendRecoverPassword(email, password);
    return res.status(200).json({ message: 'Correo de recuperación enviado.' });
  });
};
module.exports.recoverPassword = [recoverPassword];

const verifyAccount = async (req, res) => {
  const { token } = req.params;
  if (!token || !req.params) return res.status(403).send({ message: 'Forbidden' });
  try {
    const payload = await jwt.verify(token, process.env.JWT_KEY);
    const data = { isVerified: true };
    await User.findOneAndUpdate({ email: payload.email }, { $set: data }).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });

    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });

    if (err instanceof jwt.JsonWebTokenError)
      return res.status(403).json({ message: 'Invalid Token' });

    if (err instanceof jwt.TokenExpiredError)
      return res.status(403).json({ message: 'Token Expired' });

    return res.status(500).json({ message: `Internal server error` });
  }

  return res.status(200).json({ message: 'Account Verified' });
};
module.exports.verifyAccount = [verifyAccount];

const getUserById = async (req, res) => {
  const idUser = req.params.userId;
  if (req.payload.role !== roles.admin && req.payload.userId !== idUser)
    return res.status(403).json({ message: 'Forbidden' });
  try {
    const user = await User.findOne(
      { _id: idUser },
      { password: 0, createdAt: 0, updatedAt: 0, __v: 0, _id: 0 },
    ).orFail();
    return res.status(200).json(user);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports.getUserById = [authorize([roles.admin, roles.company, roles.client]), getUserById];

const getUsers = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const projection = { password: 0, createdAt: 0, updatedAt: 0, __v: 0, _id: 0 };
  let users;
  try {
    users = await User.paginate({}, { projection, limit, page });
    if (!users) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json(users);
};
module.exports.getUsers = [authorize([roles.admin]), getUsers];

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { email, password } = req.body;
  if (req.payload.role !== roles.admin && req.payload.userId !== userId)
    return res.status(403).json({ message: 'Forbidden' });
  try {
    const user = await User.findOne({ _id: userId }).orFail();
    const pass = await user.encryptPassword(password);
    const data = { $set: { email, password: pass } };
    await User.updateOne({ _id: userId }, data);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Not found resource' });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json({ message: 'Successful operation' });
};
module.exports.updateUser = [
  authorize([roles.admin, roles.company, roles.client]),
  validatePass,
  updateUser,
];

const refreshToken = async (req, res) => {
  const payload = {};
  const userInfo = {};
  let token;
  try {
    const user = await User.findOne({ _id: req.payload.userId }).orFail();

    if (user.role === roles.company) {
      const company = await Company.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, companyName: 1, customerId: 1 },
      ).orFail();
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = company._id;
      payload.customerId = company.customerId;
      payload.role = roles.company;
      userInfo.firstName = company.companyName;
    } else if (user.role === roles.admin) {
      // eslint-disable-next-line no-underscore-dangle
      const admin = await Admin.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, firstName: 1, lastName: 1 },
      );
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = admin._id;
      payload.role = roles.admin;
      userInfo.firstName = admin.firstName;
      userInfo.lastName = admin.lastName;
    } else {
      // eslint-disable-next-line no-underscore-dangle
      const client = await Client.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, firstName: 1, lastName: 1 },
      );
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = client._id;
      payload.role = roles.client;
      userInfo.firstName = client.firstName;
      userInfo.lastName = client.lastName;
    }

    // eslint-disable-next-line no-underscore-dangle
    payload.userId = user._id;
    token = await generateToken(payload);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'User not found' });
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }
  return res.status(200).json({ token, userInfo });
};

module.exports.refreshToken = [refreshToken];
