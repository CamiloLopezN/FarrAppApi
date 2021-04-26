const express = require('express');

const router = express.Router();
const controllerEvents = require('../controllers/events.controller');

router.get('', controllerEvents.getAllEvents);

module.exports = router;
