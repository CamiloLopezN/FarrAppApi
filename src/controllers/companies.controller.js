const companyCtrl = {};
const mongoose = require('mongoose');

const { Company, Establishment } = require('../models/entity.model');
const { postEstablishmentVal } = require('../middlewares/validations/establishment');
const { signUpVal, putCompany } = require('../middlewares/validations/company');
const validation = require('../middlewares/validations/validation');

/*
Registrar una compañia
 */
async function signUp(req, res) {
  const reqCompany = req.body;

  const document = new Company(reqCompany);
  document.user = {
    role: 'company',
    password: await document.user.encryptPassword(document.user.password),
    hasReqDeactivation: false,
    isActive: false,
  };

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

async function postEstablishment(req, res) {
  const { companyId } = req.query;
  const establishment = new Establishment(req.body);
  await Company.findOne({ _id: companyId }, { _id: 1, companyName: 1 })
    .then((companySearch) => {
      establishment.isActive = true;
      establishment.averageRating = 0;
      establishment.company = {
        // eslint-disable-next-line no-underscore-dangle
        companyId: companySearch._id,
        companyName: companySearch.companyName,
      };
      establishment
        .save()
        .then(() => {
          res.status(200).json({ message: 'establescimiento registrado' });
        })
        .catch((err) => {
          if (err instanceof mongoose.Error.ValidationError)
            return res
              .status(400)
              .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
          return res.status(500).json({ message: `internal server error  ${err}` });
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError)
        return res
          .status(400)
          .json({ message: 'Incomplete or bad formatted client data', errors: err.errors });
      return res.status(500).json({ message: `internal server error  ${err}` });
    });
}

companyCtrl.postEstablishment = [validation(postEstablishmentVal), postEstablishment];

module.exports = companyCtrl;
