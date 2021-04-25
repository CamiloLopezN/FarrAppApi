const mongoose = require('../config/config.database');

const { Client, User } = require('../models/entity.model');
const validatorPass = require('../middlewares/validations/password.validator');
const roles = require('../middlewares/oauth/roles');
const validation = require('../middlewares/validations/validation');
const { postClientVal, updateClientVal } = require('../middlewares/validations/client.joi');
const auth = require('../middlewares/oauth/authentication');

// eslint-disable-next-line consistent-return
const postClient = async (req, res) => {
  const { email, password, firstName, lastName, birthdate, gender } = req.body;
  try {
    const foundClient = await User.findOne({ email });
    if (foundClient) {
      return res.status(409).json({
        message: 'Invalid email or Password!',
      });
    }
    const validationPass = validatorPass.validate(password, { list: true });
    // validationPass.length === 0 significa que el array con errores de validacion esta vacio, o sea, esta correcto el formato de la contraseña
    if (validationPass.length === 0) {
      const newUser = new User({
        email,
        password,
        role: roles.client,
        hasReqDeactivation: false,
        isActive: false,
        isVerified: false,
      });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save().then(async (savedUser) => {
        const month = birthdate.split('-')[1] - 1;
        const myDate = new Date(birthdate.split('-')[2], month, birthdate.split('-')[0]);
        const client = new Client({
          // eslint-disable-next-line no-underscore-dangle
          userId: savedUser._id,
          firstName,
          lastName,
          birthdate: myDate,
          gender,
        });
        await client
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
      });
    }
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};
module.exports.postClient = [validation(postClientVal), postClient];

const updateClientProfile = async (req, res) => {
  const { clientId } = req.params;
  const { birthdate, firstName, lastName, gender } = req.body;
  if (req.id !== clientId)
    return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
  const month = birthdate.split('-')[1] - 1;
  const myDate = new Date(birthdate.split('-')[2], month, birthdate.split('-')[0]);
  const data = {
    $set: { birthdate: myDate, firstName, lastName, gender },
  };
  try {
    const update = await Client.findOneAndUpdate({ _id: req.id }, data);
    if (!update) return res.status(404).json({ message: 'Resource not found' });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
    return res.status(500).json({ message: `Internal server error  ${err}` });
  }
  return res.status(200).json({ message: 'Successful update' });
};
module.exports.updateClientProfile = [
  auth.authentication,
  auth.authorizationClient,
  validation(updateClientVal),
  updateClientProfile,
];
