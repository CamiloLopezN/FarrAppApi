const { Router } = require('express');

const router = Router();
const clientController = require('../controllers/clients.controller');

router.post('/', clientController.postClient);
router.get('/:clientId', clientController.getClientById);
router.get('/', clientController.getClients);
router.post('/:clientId', clientController.updateClientProfile);
router.post('/follow-establishment', clientController.followEstablishment);
router.post('/event-interest', clientController.interestForEvent);

module.exports = router;
