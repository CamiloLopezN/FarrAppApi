const mongoose = require('mongoose');

const validation = require('../middlewares/validations/validation');
const { postAdminVal } = require('../middlewares/validations/admin');
const validatorPass = require('../middlewares/validations/password.validator');
const { Admin, User } = require('../models/entity.model');

// eslint-disable-next-line consistent-return
const postAdmin = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const foundAdmin = await User.findOne({ email });
    if (foundAdmin)
      return res.status(409).json({
        message: 'Invalid Username or Password!',
      });
    const validationPass = validatorPass.validate(password, { list: true });
    if (validationPass.length === 0) {
      const newUser = new User({
        email,
        password,
        role: 'Admin',
        hasReqDeactivation: false,
        isActive: false,
        isVerified: false,
      });
      newUser.password = await newUser.encryptPassword(password);
      const savedUser = await newUser.save();

      // eslint-disable-next-line no-underscore-dangle
      const admin = new Admin({ userId: savedUser._id, firstName, lastName });
      await admin.save();
      return res.status(200).json({ message: 'Registro exitoso' });
    }
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};
module.exports.postAdmin = [validation(postAdminVal), postAdmin];

const getLoggedAdmin = async (req, res) => {
  try {
    const idAdmin = req.user;
    const foundAdmin = await Admin.find({ _id: idAdmin }, { firstName: 1, lastName: 1, _id: 0 });
    if (foundAdmin) return res.status(200).json({ foundAdmin });
    return res.status(404).json({ message: 'Admin not found' });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};
module.exports.getAdminById = [getLoggedAdmin];
