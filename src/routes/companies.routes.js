const { Router } = require('express');

const router = Router();
const {
  getEventById,
  getEventsByEstablishment,
  getEstablishmentById,
  getPreviewEstablishmentsOfCompany,
  getEventsByCompany,
  profile,
  getCompanies,
  updateEvent,
  registerEvent,
  updateEstablishmentById,
  registerEstablishment,
  updateProfile,
  signUp,
  deleteEventById,
  deleteEstablishmentById,
} = require('../controllers/companies.controller');

router.get('/:companyId/establishments/:establishmentId/events/:eventId', getEventById);
router.get('/:companyId/establishments/:establishmentId/events', getEventsByEstablishment);
router.get('/:companyId/establishments/:establishmentId', getEstablishmentById);
router.get('/:companyId/establishments', getPreviewEstablishmentsOfCompany);
router.get('/:companyId/events', getEventsByCompany);
router.get('/:companyId', profile);
router.get('/', getCompanies);

router.post('/:companyId/establishments/:establishmentId/events/:eventId', updateEvent);
router.post('/:companyId/establishments/:establishmentId/events', registerEvent);
router.post('/:companyId/establishments/:establishmentId', updateEstablishmentById);
router.post('/:companyId/establishments', registerEstablishment);
router.post('/:companyId', updateProfile);
router.post('/', signUp);

router.delete('/:companyId/establishments/:establishmentId/events/:eventId', deleteEventById);
router.delete('/:companyId/establishments/:establishmentId', deleteEstablishmentById);

module.exports = router;
