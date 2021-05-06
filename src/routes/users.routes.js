const express = require('express');

const router = express.Router();
const userController = require('../controllers/users.controller');

router.get('/verify-account/:token', userController.verifyAccount);
router.get('/refresh-token', userController.refreshToken);
router.get('/:userId', userController.getUserById);
router.get('/', userController.getUsers);
router.post('/login', userController.login);
router.post('/recover-password', userController.recoverPassword);
router.post('/request-deactivation/:userId', userController.reqDeactivateUser);
router.post('/:userId/account-status', userController.postUserAccount);
router.post('/:userId/update', userController.updateUser);

module.exports = router;
