const companyCtrl = {};
const mongoose = require('mongoose');

const { Company } = require('../models/entity.model');
const { signUpVal } = require('../middlewares/validations/company');
const validation = require('../middlewares/validations/validation');

async function signUp(req, res) {
  const reqCompany = req.body;

  const document = new Company(reqCompany);
  document.user.role = 'company';
  document.user.password = await document.user.encryptPassword(document.user.password);

  await document
    .save()
    .then(() => {
      res.status(200).json({ message: 'registro completo' });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError)
        return res
          .status(400)
          .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
      return res.status(500).json({ message: `internal server error  ${err}` });
    });
}

companyCtrl.signUp = [validation(signUpVal), signUp];

module.exports = companyCtrl;
