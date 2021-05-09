const { Router } = require('express');
const {
  establishmentLogo,
  establishmentPhotos,
  eventPhotos,
} = require('../controllers/uploads.controller');

const router = Router();

router.post('/establishments/logo', establishmentLogo);
router.post('/establishments/photos', establishmentPhotos);
router.post('/events/photos', eventPhotos);

module.exports = router;
