const mongoose = require('../config/config.database');

const validation = require('../middlewares/validations/validation');
const { postAdminVal, updateAdmin } = require('../middlewares/validations/admin.joi');
const { validatePass } = require('./password.controller');
const { Admin, User } = require('../models/entity.model');
const roles = require('../middlewares/oauth/roles');
const { authorize } = require('../middlewares/oauth/authentication');

// eslint-disable-next-line consistent-return
const postAdmin = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const foundAdmin = await User.findOne({ email });
    if (foundAdmin)
      return res.status(400).json({
        message: 'Admin already exists',
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
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(201).json({ message: 'Successful operation' });
};
module.exports.postAdmin = [
  authorize([roles.admin]),
  validation(postAdminVal),
  validatePass,
  postAdmin,
];

const getAdminById = async (req, res) => {
  let foundAdmin;
  try {
    const { adminId } = req.params;
    foundAdmin = await Admin.find({ _id: adminId }, { firstName: 1, lastName: 1, _id: 0 }).orFail();
  } catch (error) {
    if (error instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Admin not found' });
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
  return res.status(200).json(foundAdmin);
};
module.exports.getAdminById = [authorize([roles.admin]), getAdminById];

const updateProfileAdmin = async (req, res) => {
  let update;
  try {
    const { adminId } = req.params;
    const data = {
      $set: req.body,
    };
    update = await Admin.findOneAndUpdate({ _id: adminId }, data).orFail();
  } catch (error) {
    if (error instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: 'Resource not found' });
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `Internal server error` });
  }
  return res.status(200).json({ message: 'Successful operation' });
};

module.exports.updateProfileAdmin = [
  authorize([roles.admin]),
  validation(updateAdmin),
  updateProfileAdmin,
];
