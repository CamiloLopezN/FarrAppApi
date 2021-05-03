const jwt = require('jsonwebtoken');
const {
  sendValidation,
  sendRecoverPassword,
  sendCreatedUserByAdmin,
  sendEmailRegisterCompany,
} = require('../mail/index');

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

module.exports.sendCreatedUserByAdmin = (userMail, userName, generatedPassword) => {
  sendCreatedUserByAdmin(userMail, userName, generatedPassword);
};

module.exports.sendEmailRegisterCompany = (userMail, companyName) => {
  sendEmailRegisterCompany(userMail, companyName);
};

module.exports.randomPassword = (length, type) => {
  let characters;
  switch (type) {
    case 'num':
      characters = '0123456789';
      break;
    case 'alf':
      characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      break;
    case 'rand':
      // FOR ↓
      break;
    default:
      characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      break;
  }
  let pass = 'D';
  for (let i = 0; i < length; i += 1) {
    if (type === 'rand') {
      pass += String.fromCharCode((Math.floor(Math.random() * 100) % 94) + 33);
    } else {
      pass += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  return pass;
};
