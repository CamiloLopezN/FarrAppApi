const { Router } = require('express');

const router = Router();
const clientController = require('../controllers/clients.controller');

router.post('/', clientController.postClient);
router.get('/:clientId', clientController.getClientById);
router.get('/', clientController.getClients);
router.put('/:clientId/update', clientController.updateClientProfile);

module.exports = router;
