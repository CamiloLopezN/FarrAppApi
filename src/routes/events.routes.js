const express = require('express');

const router = express.Router();
const { getEventsLandingPage, postReviewEvent } = require('../controllers/events.controller');

router.get('/', getEventsLandingPage);
router.post('/:eventId/review', postReviewEvent);

module.exports = router;
