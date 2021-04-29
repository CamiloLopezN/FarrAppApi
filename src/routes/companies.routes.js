const { Router } = require('express');

const router = Router();
const companiesCtrl = require('../controllers/companies.controller');
const establishmentsCtrl = require('../controllers/establishments.controller');
const eventCtrl = require('../controllers/events.controller');

router.post('/', companiesCtrl.signUp);
router.get('/', companiesCtrl.getCompanies);
router.get('/:companyId', companiesCtrl.profile);
router.post('/:companyId', companiesCtrl.updateProfile);
router.get('/:companyId/events', companiesCtrl.getEventsByCompany);
router.post('/:companyId/establishments', companiesCtrl.registerEstablishment);
router.get('/:companyId/establishments', companiesCtrl.getPreviewEstablishmentsOfCompany);
router.get('/:companyId/establishments/:establishmentId', companiesCtrl.getEstablishmentById);

router.post('/:companyId/establishments/:establishmentId', companiesCtrl.updateEstablishmentById);

router.delete('/:companyId/establishments/:establishmentId', companiesCtrl.deleteEstablishmentById);

router.post('/:companyId/establishments/:establishmentId/events', companiesCtrl.registerEvent);

router.get(
  '/:companyId/establishments/:establishmentId/events',
  companiesCtrl.getEventsByEstablishment,
);

router.get(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  companiesCtrl.getEventbyId,
);

router.delete(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  companiesCtrl.deleteEventById,
);

router.post(
  '/:companyId/establishments/:establishmentId/events/:eventId',
  companiesCtrl.updateEvent,
);

router.post('/establishments/:establishmentId/review', establishmentsCtrl.postReviewEstablishment);

router.post('/events/:eventId/review', eventCtrl.postReviewEvent);

module.exports = router;
