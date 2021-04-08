const companyCtrl = {};
const mongoose = require('mongoose');

const { Company } = require('../models/entity.model');
const { signUpVal, putCompany } = require('../middlewares/validations/company');
const validation = require('../middlewares/validations/validation');

/*
Registrar una compañia
 */
async function signUp(req, res) {
  const reqCompany = req.body;

  const document = new Company(reqCompany);
  document.user.role = 'company';
  document.user.password = await document.user.encryptPassword(document.user.password);
  document.user.hasReqDeactivation = false;
  document.user.isActive = false;
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

/*
La compania obtiene su propia información
 */
async function profile(req, res) {
  const { id } = req.query;
  await Company.findOne({ _id: id }, { user: 0, __v: 0 }).then((doc) => {
    res.status(200).json(doc);
  });
}

companyCtrl.profile = [profile];

/*
Actualizar la información del perfil
 */
async function updateProfile(req, res) {
  const { id } = req.query;
  const { body } = req;
  const data = {
    $set: body,
  };
  await Company.updateOne(
    {
      _id: id,
    },
    data,
  )
    .then(() => {
      res.status(200).json({ message: 'actualización correcta' });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError)
        return res
          .status(400)
          .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
      return res.status(500).json({ message: `internal server error  ${err}` });
    });
}

companyCtrl.updateProfile = [validation(putCompany), updateProfile];

module.exports = companyCtrl;
