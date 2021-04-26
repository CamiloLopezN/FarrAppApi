const validatorPassCtrl = {};
const validatorPass = require('../middlewares/validations/password.validator');

validatorPassCtrl.validatePass = async (req, res, next) => {
  const validation = validatorPass.validate(req.body.password, { list: true });
  if (validation.length !== 0) return res.status(400).json({ message: 'bad formated password' });
  return next();
};

module.exports = validatorPassCtrl;
