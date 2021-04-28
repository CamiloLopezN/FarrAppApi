const { Router } = require('express');

const router = Router();
const companiesController = require('../controllers/companies.controller');
const { authentication, authorizationCompany } = require('../middlewares/oauth/authentication');

router.post('/', companiesController.signUp);
router.get('/', authentication, companiesController.getCompanies);
router.get('/:companyId', authentication, companiesController.profile);
router.post('/:companyId', authentication, authorizationCompany, companiesController.updateProfile);
router.get(
  '/:companyId/events',
  authentication,
  authorizationCompany,
  companiesController.getEventsByCompany,
);
router.post(
  '/:companyId/establishments',
  authentication,
  authorizationCompany,
  companiesController.registerEstablishment,
);
router.get(
  '/:companyId/establishments',
  authentication,
  companiesController.getPreviewEstablishmentsOfCompany,
);
router.get(
  '/:companyId/establishments/:establishmentId',
  authentication,
  authorizationCompany,
  companiesController.getEstablishmentById,
);

router.post(
  '/:companyId/establishments/:establishmentId',
  authentication,
  authorizationCompany,
  companiesController.updateEstablishmentById,
);

router.delete(
  '/:companyId/establishments/:establishmentId',
  authentication,
  authorizationCompany,
  companiesController.deleteEstablishmentById,
);

router.post(
  '/:companyId/establishments/:establishmentId/events',
  authentication,
  authorizationCompany,
  companiesController.registerEvent,
);

router.get(
  '/:companyId/establishments/:establishmentId/events',
  authentication,
  authorizationCompany,
  companiesController.getEventsByEstablishment,
);

router.get(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  authentication,
  authorizationCompany,
  companiesController.getEventbyId,
);

router.post(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  authentication,
  authorizationCompany,
  companiesController.updateEvent,
);

module.exports = router;
