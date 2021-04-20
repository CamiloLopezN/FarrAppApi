const jwt = require('jsonwebtoken');
const { sendValidation } = require('../mail/index');

const privateKey = process.env.JWT_KEY;

module.exports.sendAccountValidator = (user, validationURL) => {
  const token = jwt.sign({ email: user.email, username: user.username }, privateKey, {
    expiresIn: '1d',
  });
  sendValidation(user.email, token, validationURL);
  console.log(token);
};
