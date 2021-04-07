const { Router } = require('express');

const router = Router();
const companiesController = require('../controllers/companies.controller');

router.post('/', companiesController.signUp);

module.exports = router;
