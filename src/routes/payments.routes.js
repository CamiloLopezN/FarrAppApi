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
  getMemberships,
  getMembershipById,
  getLastMembership,
  // postMembership,
  postPaidMembership,
} = require('../controllers/payments.controller');

router.get('/companies/:companyId/memberships/last', getLastMembership);
router.get('/companies/:companyId/memberships/:membershipId', getMembershipById);
router.get('/companies/:companyId/memberships', getMemberships);
router.get('/customers/subscriptions/:subscriptionId/cancel', getCancelSubscription);
router.get('/customers/:customerId', getCustomer);
router.get('/customers', listCustomers);
router.get('/plans', getPlans);

router.post('/companies/:companyId/paid-membership', postPaidMembership);
router.post('/customers/:customerId/default-card', changeDefaultCard);
router.post('/customers/:customerId/cards', addCustomerCard);
router.post('/customers/subscriptions', postSubscription);
router.post('/credit-token', postToken);
router.post('/customers', postCompanyCustomer);
router.delete('/customers/:customerId/cards', removeCustomerCard);

module.exports = router;
