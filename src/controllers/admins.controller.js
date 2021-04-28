const mongoose = require('../config/config.database');

const validation = require('../middlewares/validations/validation');
const { postAdminVal, updateAdmin } = require('../middlewares/validations/admin.joi');
const { validatePass } = require('./password.controller');
const { Admin, User } = require('../models/entity.model');
const roles = require('../middlewares/oauth/roles');
const auth = require('../middlewares/oauth/authentication');

// eslint-disable-next-line consistent-return
const postAdmin = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const foundAdmin = await User.findOne({ email });
    if (foundAdmin)
      return res.status(409).json({
        message: 'Invalid email or Password!',
      });
    const newUser = new User({
      email,
      password,
      role: roles.admin,
      hasReqDeactivation: false,
      isActive: true,
      isVerified: true,
    });
    newUser.password = await newUser.encryptPassword(password);
    const savedUser = await newUser.save();

    // eslint-disable-next-line no-underscore-dangle
    const admin = new Admin({ userId: savedUser._id, firstName, lastName });
    await admin.save((err) => {
      if (err) {
        res.status(400).json({ message: 'Bad Request' });
      }
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
  return res.status(200).json({ message: 'Registro exitoso' });
};
module.exports.postAdmin = [
  auth.authentication,
  auth.authorizationAdmin,
  validation(postAdminVal),
  validatePass,
  postAdmin,
];

const getAdminById = async (req, res) => {
  try {
    const { adminId } = req.params;
    const foundAdmin = await Admin.find({ _id: adminId }, { firstName: 1, lastName: 1, _id: 0 });
    if (foundAdmin) return res.status(200).json({ message: foundAdmin });
    return res.status(404).json({ message: 'Admin not found' });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};
module.exports.getAdminById = [auth.authentication, auth.authorizationAdmin, getAdminById];

const updateProfileAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const data = {
      $set: req.body,
    };
    const update = await Admin.updateOne({ _id: adminId }, data);
    if (!update) return res.status(404).json({ message: 'Resource not found' });
    return res.status(200).json({ message: req.body });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};

module.exports.updateProfileAdmin = [
  auth.authentication,
  auth.authorizationAdmin,
  validation(updateAdmin),
  updateProfileAdmin,
];
