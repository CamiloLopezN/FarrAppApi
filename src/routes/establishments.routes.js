const express = require('express');

const router = express.Router();
const {
  postReviewEstablishment,
  getEstablishmentLandingPage,
} = require('../controllers/establishments.controller');

router.post('/:establishmentId/review', postReviewEstablishment);
router.get('/', getEstablishmentLandingPage);

module.exports = router;
