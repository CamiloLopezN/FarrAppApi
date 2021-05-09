const moment = require('moment');
const mongoose = require('mongoose');
const { authorize } = require('../middlewares/oauth/authentication');
const roles = require('../middlewares/oauth/roles');
const payments = require('../payments');
const { Company } = require('../models/entity.model');

const tax = 0.19;

module.exports.postToken = (req, res) => {
  const { number, expYear, expMonth, cvc } = req.body;
  payments.createToken(number, expYear, expMonth, cvc, (error, token) => {
    if (error) return res.status(503).json({ message: 'Service unavailable' });
    if (!token.status) return res.status(400).json({ message: 'Error creating token' });
    return res.status(200).json({
      tokenId: token.id,
    });
  });
};

const getCustomers = async (req, res) => {
  const customers = await payments.listCustomers();
  return res.status(200).json(customers);
};
module.exports.listCustomers = [authorize([roles.admin]), getCustomers];

const postCustomer = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    city,
    address,
    phone,
    cellPhone,
    cardNumber,
    cardExpYear,
    cardExpMonth,
    cardCVC,
    isDefaultCard,
    companyId,
  } = req.body;
  if (req.payload.role === roles.company && req.payload.roleId !== companyId)
    return res.status(403).json({ message: 'Forbidden' });
  let customer;
  try {
    const token = await payments.createToken(cardNumber, cardExpYear, cardExpMonth, cardCVC);
    if (!token.status) return res.status(400).json(token.data);
    customer = await payments.createCustomer(
      token.id,
      firstName,
      lastName,
      email,
      isDefaultCard,
      city,
      address,
      phone,
      cellPhone,
    );
    if (!customer.status) return res.status(400).json(customer.data);
    await Company.findOneAndUpdate(
      { _id: companyId },
      { customerId: customer.data.customerId },
    ).orFail();
  } catch (error) {
    if (error) return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json({
    customerId: customer.data.customerId,
    email: customer.data.email,
    name: customer.data.name,
  });
};
module.exports.postCompanyCustomer = [authorize([roles.company, roles.admin]), postCustomer];

const subscribeToPlan = async (req, res) => {
  const { planId, customerId, cardToken, docType, docNumber } = req.body;
  if (req.payload.role === roles.company && req.payload.customerId !== customerId)
    return res.status(403).json({ message: 'Forbidden' });
  let suscrib;
  try {
    suscrib = await payments.subscribeCustomer(planId, customerId, cardToken, docType, docNumber);
    if (!suscrib.status) return res.status(400).json({ message: 'Error creating subscription' });
  } catch (e) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(suscrib);
};
module.exports.postSubscription = [authorize([roles.admin, roles.company]), subscribeToPlan];

const cancelSubscription = async (req, res) => {
  let cancellation;
  try {
    const subscription = await payments.retrieveSubscription(req.params.subscriptionId);
    if (!subscription.status) return res.status(404).json({ message: 'Subscription not found' });
    if (req.payload.role === roles.company && subscription.customer !== req.payload.customerId)
      return res.status(403).json({ message: 'Unauthorized' });
    cancellation = await payments.cancelSubscriptionToPlan(req.params.subscriptionId);
    if (!cancellation.status) return res.status(400).json({ message: 'Unsubscribe error' });
  } catch (e) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(cancellation);
};
module.exports.getCancelSubscription = [
  authorize([roles.admin, roles.company]),
  cancelSubscription,
];

const getPlans = async (req, res) => {
  let plans;
  let treatedPlans;
  try {
    plans = await payments.listPlans();
    treatedPlans = plans.data.map((plan) => ({
      planId: plan.id_plan,
      planName: plan.description,
      price: plan.amount + plan.amount * tax,
      intervalCount: plan.interval_count,
      intervalUnit: plan.interval,
      trialDays: plan.trial_days,
      taxBase: plan.amount,
      tax: plan.amount * tax,
    }));
  } catch (error) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(treatedPlans);
};
module.exports.getPlans = [
  authorize([roles.company, roles.admin, roles.client, roles.guest]),
  getPlans,
];

const getCustomerById = async (req, res) => {
  let customer;
  try {
    if (req.payload.role === roles.company && req.params.customerId !== req.payload.customerId)
      return res.status(403).json({ message: 'Unauthorized' });
    customer = await payments.getCustomerById(req.params.customerId);
    if (customer.status === false) return res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(customer.data);
};
module.exports.getCustomer = [authorize([roles.company, roles.admin]), getCustomerById];

const changeDefaultCard = async (req, res) => {
  let defaultCard;
  const { cardFranchise, cardToken, cardMask } = req.body;
  if (req.payload.role === roles.company && req.params.customerId !== req.payload.customerId)
    return res.status(403).json({ message: 'Unauthorized' });
  try {
    defaultCard = await payments.changeDefaultCard(
      cardFranchise,
      cardToken,
      cardMask,
      req.params.customerId,
    );
    if (!defaultCard.status) return res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(defaultCard.data);
};
module.exports.changeDefaultCard = [authorize([roles.admin, roles.company]), changeDefaultCard];

const addCustomerCard = async (req, res) => {
  const { customerId } = req.params;
  const { cardNumber, cardExpYear, cardExpMonth, cardCVC } = req.body;
  if (req.payload.role === roles.company && customerId !== req.payload.customerId)
    return res.status(403).json({ message: 'Unauthorized' });
  try {
    const token = await payments.createToken(cardNumber, cardExpYear, cardExpMonth, cardCVC);
    if (!token.status) return res.status(400).json(token.data);
    const card = await payments.addCustomerCard(token.id, customerId);
    if (!card.status) return res.status(400).json(card.data);
  } catch (err) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(201).json({ message: 'Card added successfully' });
};
module.exports.addCustomerCard = [authorize([roles.admin, roles.company]), addCustomerCard];

const removeCustomerCard = async (req, res) => {
  let removedCard;
  const { franchise, mask } = req.query;
  if (req.payload.role === roles.company && req.params.customerId !== req.payload.customerId)
    return res.status(403).json({ message: 'Unauthorized' });
  try {
    removedCard = await payments.removeCustomerCard(franchise, mask, req.params.customerId);
    if (!removedCard.status) return res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json({ message: 'Card successfully removed' });
};
module.exports.removeCustomerCard = [authorize([roles.admin, roles.company]), removeCustomerCard];

const getMemberships = async (req, res) => {
  const { customerId } = req.params;
  let company;
  try {
    company = await Company.findOne({ customerId }).orFail();
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError || e instanceof mongoose.Error.CastError)
      return res.status(404).json({ message: 'Resource not found' });
    if (e instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json(company.memberships);
};
module.exports.getMemberships = [authorize([roles.admin, roles.company]), getMemberships];

const getMembershipById = async (req, res) => {
  const { customerId, membershipId } = req.params;
  let company;
  let membership;
  try {
    company = await Company.findOne({ customerId }).orFail();
    membership = company.memberships.id(membershipId);
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError || e instanceof mongoose.Error.CastError)
      return res.status(404).json({ message: 'Resource not found' });
    if (e instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: 'Incomplete or bad formatted client data' });
    return res.status(500).json({ message: 'Internal server error' });
  }
  return res.status(200).json(membership);
};
module.exports.getMembershipById = [authorize([roles.admin, roles.company]), getMembershipById];

const getLastMembership = async (req, res) => {
  let membership;
  try {
    const company = await Company.findOne({ _id: req.params.companyId }).orFail();
    membership = company.currentMembership || {};
  } catch (error) {
    if (
      error instanceof mongoose.Error.CastError ||
      error instanceof mongoose.Error.DocumentNotFoundError
    )
      return res.status(404).json({ message: 'Company not found' });
    return res.status(500).json({ message: 'Internal server error', error });
  }
  return res.status(200).json(membership);
};
module.exports.getLastMembership = [authorize([roles.admin, roles.company]), getLastMembership];

const postPaidMembership = async (req, res) => {
  const { companyId } = req.params;
  const { paymentRef } = req.body;
  let membership;
  try {
    const paymentDetail = await payments.transactionDetails(paymentRef);
    const plan = await payments.getPlan(paymentDetail.extras.extra1);
    if (paymentDetail.response !== 'Aprobada')
      return res.status(400).json({ message: 'Transaction not approved' });
    const periodStart = moment();
    const { interval_count: intervalCount, interval } = plan.plan;
    const periodEnd = moment(periodStart).add(intervalCount, interval);
    membership = {
      orderReference: paymentDetail.bill,
      orderStatus: paymentDetail.response,
      orderDate: moment(paymentDetail.transactionDate).toDate(),
      description: paymentDetail.description,
      periodStart,
      periodEnd,
      paymentType: 'Pago fijo',
      paymentMethod: payments.franchises[paymentDetail.paymentMethod],
      price: paymentDetail.amount,
      tax: paymentDetail.tax,
    };
    await Company.findOneAndUpdate(
      { _id: companyId },
      { $set: { currentMembership: membership }, $push: { memberships: membership } },
    ).orFail();
  } catch (error) {
    if (
      error instanceof mongoose.Error.CastError ||
      error instanceof mongoose.Error.DocumentNotFoundError
    )
      return res.status(404).json({ message: 'Company not found' });
    return res.status(500).json({ message: 'Internal server error', error });
  }
  return res.status(200).json({ message: 'Successful operation', membership });
};
module.exports.postPaidMembership = [authorize(roles.company), postPaidMembership];
