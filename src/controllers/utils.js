const jwt = require('jsonwebtoken');
const { sendValidation, sendRecoverPassword } = require('../mail/index');

const privateKey = process.env.JWT_KEY;

module.exports.sendAccountValidator = (user, validationURL) => {
  const token = jwt.sign({ email: user.email, username: user.username }, privateKey, {
    expiresIn: '1d',
  });
  sendValidation(user.email, token, validationURL);
};

module.exports.sendRecoverPassword = (email, tempPassword) => {
  sendRecoverPassword(email, tempPassword);
};