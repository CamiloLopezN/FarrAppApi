const express = require('express');

const router = express.Router();
const controllerEst = require('../controllers/establishments.controller');

router.post('/:establishmentId/review', controllerEst.postReviewEstablishment);
router.get('/', controllerEst.getEstablishmentLandingPage);

module.exports = router;
