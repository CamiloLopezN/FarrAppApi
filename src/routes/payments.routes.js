const express = require('express');

const router = express.Router();
const {
  postToken,
  listCustomers,
  getCustomer,
  postCompanyCustomer,
  getPlans,
  postSubscription,
  getCancelSubscription,
  changeDefaultCard,
  addCustomerCard,
  removeCustomerCard,
} = require('../controllers/payments.controller');

router.post('/credit-token', postToken);
router.get('/customers', listCustomers);
router.post('/customers/:customerId/cards', addCustomerCard);
router.delete('/customers/:customerId/cards', removeCustomerCard);
router.post('/customers/:customerId/default-card', changeDefaultCard);
router.get('/customers/:customerId', getCustomer);
router.post('/customers', postCompanyCustomer);
router.post('/customers/subscriptions', postSubscription);
router.get('/customers/subscriptions/:subscriptionId/cancel', getCancelSubscription);
router.get('/plans', getPlans);

module.exports = router;
