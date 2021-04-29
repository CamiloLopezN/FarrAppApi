const { Router } = require('express');

const router = Router();
const clientController = require('../controllers/clients.controller');

router.post('/', clientController.postClient);
router.get('/', clientController.getClients);
router.post('/follow-establishment', clientController.followEstablishment);
router.post('/event-interest', clientController.interestForEvent);
router.get('/:clientId', clientController.getClientById);
router.post('/:clientId', clientController.updateClientProfile);

module.exports = router;
