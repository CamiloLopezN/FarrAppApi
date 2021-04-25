const { Router } = require('express');

const router = Router();
const clientController = require('../controllers/clients.controller');

router.post('/', clientController.postClient);

module.exports = router;
