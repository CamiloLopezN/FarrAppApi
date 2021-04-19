const { Router } = require('express');

const router = Router();
const adminsController = require('../controllers/admins.controller');

router.post('/', adminsController.postAdmin);

module.exports = router;
