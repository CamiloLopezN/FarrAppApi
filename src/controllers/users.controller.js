const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Company, Admin, Client } = require('../models/entity.model');
const { generateToken } = require('../middlewares/oauth/authentication');
const roles = require('../middlewares/oauth/roles');
const utils = require('./utils');
const { generatePasswordRand } = require('../utilities/generatePass');

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  let token;
  let roleId;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: 'Incomplete or bad formatted data' });

    if (!user.isVerified) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    }

    if (user.role === roles.companyRole) {
      // eslint-disable-next-line no-underscore-dangle
      roleId = await Company.findOne({ userId: user._id }, { _id: 1 });
    } else if (user.role === roles.adminRole) {
      // eslint-disable-next-line no-underscore-dangle
      roleId = await Admin.findOne({ userId: user._id }, { _id: 1 });
    } else {
      // eslint-disable-next-line no-underscore-dangle
      roleId = await Client.findOne({ userId: user._id }, { _id: 1 });
    }

    const payload = {
      // eslint-disable-next-line no-underscore-dangle
      userId: user._id,
      // eslint-disable-next-line no-underscore-dangle
      roleId: roleId._id,
      role: user.role,
    };

    token = await generateToken(payload);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }
  return res.status(200).json({ token });
};

module.exports.reqDeactiveUser = async (req, res) => {
  try {
    const { userId } = req.payload;
    const { idToReqDeactive } = req.params;
    if (userId !== idToReqDeactive)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    const data = {
      $set: {
        hasReqDeactivation: true,
      },
    };
    const update = await User.findOneAndUpdate({ _id: idToReqDeactive }, data);
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

// eslint-disable-next-line consistent-return
module.exports.recoverPassword = async (req, res) => {
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
