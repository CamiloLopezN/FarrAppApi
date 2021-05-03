const express = require('express');

const router = express.Router();
const userController = require('../controllers/users.controller');

router.post('/login', userController.login);
router.get('/refresh-token', userController.refreshToken);
router.post('/request-deactivation/:userId', userController.reqDeactivateUser);
router.post('/recover-password', userController.recoverPassword);
router.get('/verify-account/:token', userController.verifyAccount);
router.get('/:userId', userController.getUserById);
router.post('/:userId/update', userController.updateUser);
router.get('/', userController.getUsers);

module.exports = router;
