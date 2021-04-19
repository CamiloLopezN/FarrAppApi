const { Router } = require('express');

const router = Router();
const adminsController = require('../controllers/admins.controller');

router.post('/', adminsController.postAdmin);
router.post('/:adminId', adminsController.getAdminById);

module.exports = router;
