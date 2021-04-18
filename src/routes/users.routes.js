const express = require('express');

const router = express.Router();
const userController = require('../controllers/users.controller');
const validator = require('../middlewares/validations/validation');
const { login } = require('../middlewares/validations/user.joi');
/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post('/login', validator(login), userController.login);

module.exports = router;
