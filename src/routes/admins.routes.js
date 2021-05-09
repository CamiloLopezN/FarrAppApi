const { Router } = require('express');

const router = Router();
const adminsController = require('../controllers/admins.controller');

router.get('/clients/:clientId', adminsController.getClientById);
router.get('/clients', adminsController.getClientAccounts);
router.get('/companies/:companyId', adminsController.getCompanyById);
router.get('/companies', adminsController.getCompanyAccounts);
router.get('/:adminId', adminsController.getAdminById);
router.post('/:adminId', adminsController.updateProfileAdmin);
router.post('/', adminsController.postAdmin);

module.exports = router;
