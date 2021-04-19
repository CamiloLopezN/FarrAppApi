const { Router } = require('express');

const router = Router();
const companiesController = require('../controllers/companies.controller');
const { authentication, authorizationCompany } = require('../middlewares/oauth/authentication');

router.post('/', companiesController.signUp);
router.get('/', authentication, companiesController.getCompanies);
router.get('/:companyId', authentication, companiesController.profile);
router.post('/:companyId', authentication, authorizationCompany, companiesController.updateProfile);
router.post(
  '/:companyId/establishments',
  authentication,
  authorizationCompany,
  companiesController.registerEstablishment,
);
router.get(
  '/:companyId/establishments',
  authentication,
  companiesController.establishmentsOfCompany,
);

module.exports = router;
