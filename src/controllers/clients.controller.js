const mongoose = require('../config/config.database');

const { Client, User } = require('../models/entity.model');
const validatorPass = require('../middlewares/validations/password.validator');
const roles = require('../middlewares/oauth/roles');
const validation = require('../middlewares/validations/validation');
const { postClientVal } = require('../middlewares/validations/client.joi');

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
        role: roles.clientRole,
        hasReqDeactivation: false,
        isActive: false,
        isVerified: false,
      });
      newUser.password = await newUser.encryptPassword(password);
      const savedUser = await newUser.save();

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
      await client.save();
      return res.status(200).json({ message: 'Registro exitoso' });
    }
    return res.status(409).json({ message: `Invalid data: ${validationPass}` });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: 'Incomplete or bad formatted client data', errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};

module.exports.postClient = [validation(postClientVal), postClient];
