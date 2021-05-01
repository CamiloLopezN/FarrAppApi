const express = require('express');

const router = express.Router();
const controllerEvents = require('../controllers/events.controller');

router.get('/', controllerEvents.getAllEvents);
router.post('/:eventId/review', controllerEvents.postReviewEvent);

module.exports = router;
