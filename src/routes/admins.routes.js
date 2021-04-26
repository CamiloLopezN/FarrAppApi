const { Router } = require('express');

const router = Router();
const adminsController = require('../controllers/admins.controller');

router.post('/', adminsController.postAdmin);
router.get('/:adminId', adminsController.getAdminById);
router.put('/:adminId/update', adminsController.updateProfileAdmin);

module.exports = router;
