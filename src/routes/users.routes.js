const express = require('express');

const router = express.Router();
const userController = require('../controllers/users.controller');
const validator = require('../middlewares/validations/validation');
const { login, email } = require('../middlewares/validations/user.joi');
const auth = require('../middlewares/oauth/authentication');

router.post('/login', validator(login), userController.login);
router.get('/refresh-token', userController.refreshToken);
router.post(
  '/request-deactivation/:idToReqDeactive',
  auth.authentication,
  userController.reqDeactiveUser,
);
router.post('/recover-password', validator(email), userController.recoverPassword);
router.get('/verify-account/:token', userController.verifyAccount);
router.get('/:userId', userController.getUserById);
router.post('/:userId/update', validator(login), userController.updateUser);
router.get('/', userController.getUsers);

module.exports = router;
