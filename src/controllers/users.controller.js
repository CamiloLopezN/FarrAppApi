const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Company, Admin, Client } = require('../models/entity.model');
const roles = require('../middlewares/oauth/roles');
const { generateToken } = require('../middlewares/oauth/authentication');

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
  return res.status(200).json({ message: token });
};

module.exports.reqDesactiveUser = async (req, res) => {
  try {
    const { userId } = req.payload;
    const { idToReqDesactive } = req.params;
    if (userId !== idToReqDesactive)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    const data = {
      $set: {
        hasReqDeactivation: true,
      },
    };
    const update = await User.findOneAndUpdate({ _id: idToReqDesactive }, data);
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
