const express = require('express');

const router = express.Router();
const userController = require('../controllers/users.controller');
const validator = require('../middlewares/validations/validation');
const { login } = require('../middlewares/validations/user.joi');
const auth = require('../middlewares/oauth/authentication');
/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post('/login', validator(login), userController.login);
router.put(
  '/request-desactive/:idToReqDesactive',
  auth.authentication,
  userController.reqDesactiveUser,
);

module.exports = router;
