const { Router } = require('express');

const router = Router();
const companiesController = require('../controllers/companies.controller');
const establishmentsController = require('../controllers/establishments.controller');
const eventController = require('../controllers/events.controller');
const {
  authentication,
  authorizationCompany,
  authorizationClient,
} = require('../middlewares/oauth/authentication');

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

router.delete(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  authentication,
  authorizationCompany,
  companiesController.deleteEventById,
);

router.post(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  authentication,
  authorizationCompany,
  companiesController.updateEvent,
);

router.post(
  '/establishments/:establishmentId/review',
  authentication,
  authorizationClient,
  establishmentsController.postReviewEstablishment,
);

router.post(
  '/events/:eventId/review',
  authentication,
  authorizationClient,
  eventController.postReviewEvent,
);

module.exports = router;
