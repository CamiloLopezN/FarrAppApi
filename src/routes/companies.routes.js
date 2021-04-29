const { Router } = require('express');

const router = Router();
const companiesController = require('../controllers/companies.controller');
const establishmentsController = require('../controllers/establishments.controller');
const eventController = require('../controllers/events.controller');

router.post('/', companiesController.signUp);
router.get('/', companiesController.getCompanies);
router.get('/:companyId', companiesController.profile);
router.post('/:companyId', companiesController.updateProfile);
router.get('/:companyId/events', companiesController.getEventsByCompany);
router.post('/:companyId/establishments', companiesController.registerEstablishment);
router.get('/:companyId/establishments', companiesController.getPreviewEstablishmentsOfCompany);
router.get('/:companyId/establishments/:establishmentId', companiesController.getEstablishmentById);

router.post(
  '/:companyId/establishments/:establishmentId',
  companiesController.updateEstablishmentById,
);

router.delete(
  '/:companyId/establishments/:establishmentId',
  companiesController.deleteEstablishmentById,
);

router.post(
  '/:companyId/establishments/:establishmentId/events',
  companiesController.registerEvent,
);

router.get(
  '/:companyId/establishments/:establishmentId/events',
  companiesController.getEventsByEstablishment,
);

router.get(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  companiesController.getEventbyId,
);

router.delete(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  companiesController.deleteEventById,
);

router.post(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  companiesController.updateEvent,
);

router.post(
  '/establishments/:establishmentId/review',
  establishmentsController.postReviewEstablishment,
);

router.post('/events/:eventId/review', eventController.postReviewEvent);

module.exports = router;
