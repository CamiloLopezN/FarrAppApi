const express = require('express');

const router = express.Router();
const {
  postToken,
  getCustomers,
  getCustomer,
  postCompanyCustomer,
  getPlans,
  postSubscription,
  getCancelSubscription,
} = require('../controllers/payments.controller');

router.post('/credit-token', postToken);
router.get('/customers', getCustomers);
router.get('/customers/:customerId', getCustomer);
/*
router.get('/customers/:customerId', getCustomer);
* */
router.post('/customers', postCompanyCustomer);
router.post('/customers/subscriptions', postSubscription);
router.get('/customers/subscriptions/:subscriptionId/cancel', getCancelSubscription);
router.get('/plans', getPlans);

module.exports = router;
