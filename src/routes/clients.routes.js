const { Router } = require('express');

const router = Router();
const clientController = require('../controllers/clients.controller');

router.post('/', clientController.postClient);
router.get('/:clientId', clientController.getClientById);
router.get('/', clientController.getClients);
router.put('/:clientId/update', clientController.updateClientProfile);
router.put('/follow-establishment', clientController.followEstablishment);
router.put('/interest-for-event', clientController.interestForEvent);

module.exports = router;
