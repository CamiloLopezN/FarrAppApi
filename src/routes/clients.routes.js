const { Router } = require('express');

const router = Router();
const clientController = require('../controllers/clients.controller');

router.post('/', clientController.postClient);
router.post('/:clientId', clientController.getClientById);
router.put('/:clientId/update', clientController.updateClientProfile);

module.exports = router;
