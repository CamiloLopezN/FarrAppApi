const express = require('express');

const router = express.Router();
const userController = require('../controllers/users.controller');
const validator = require('../middlewares/validations/validation');
const { login, email } = require('../middlewares/validations/user.joi');
const auth = require('../middlewares/oauth/authentication');
/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post('/login', validator(login), userController.login);
router.put(
  '/request-deactivation/:idToReqDeactive',
  auth.authentication,
  userController.reqDeactiveUser,
);
router.post('/recover-password', validator(email), userController.recoverPassword);

module.exports = router;
