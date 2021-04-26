const validatorPass = require('../middlewares/validations/password.validator');

module.exports.validatePass = async (req, res, next) => {
  if (req.body.password != null) {
    const validation = validatorPass.validate(req.body.password, { list: true });
    if (validation.length !== 0) return res.status(400).json({ message: 'Bad formated password' });
  }
  return next();
};
