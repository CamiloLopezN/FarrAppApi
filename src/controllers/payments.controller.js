const auth = require('../middlewares/oauth/authentication');
const {
  createToken,
  listCustomers,
  createCustomer,
  listPlans,
  subscribeCustomer,
  cancelSubscriptionToPlan,
} = require('../payments/index');
const payment = require('../payments/index');
const { Company } = require('../models/entity.model');

const tax = 0.19;

module.exports.postToken = (req, res) => {
  const { number, expYear, expMonth, cvc } = req.body;
  createToken(number, expYear, expMonth, cvc, (error, token) => {
    if (error) return res.status(503).json({ message: 'Service unavailable' });
    if (!token.status) return res.status(400).json({ message: 'Error creating token' });
    return res.status(200).json({
      tokenId: token.id,
    });
  });
};

const getCustomers = async (req, res) => {
  const customers = await listCustomers();
  return res.status(200).json(customers);
};

module.exports.listCustomers = [auth.authentication, auth.authorizationAdmin, getCustomers];

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
  } = req.body;
  let customer;
  try {
    const token = await createToken(cardNumber, cardExpYear, cardExpMonth, cardCVC);
    if (!token.status) return res.status(400).json(token.data);
    customer = await createCustomer(
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
      { _id: req.payload.roleId },
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

module.exports.postCompanyCustomer = [auth.authentication, auth.authorizationCompany, postCustomer];

const subscribeToPlan = async (req, res) => {
  const { planId, customerId, cardToken, docType, docNumber } = req.body;
  let suscrib;
  try {
    suscrib = await subscribeCustomer(planId, customerId, cardToken, docType, docNumber);
    if (!suscrib.status) return res.status(400).json({ message: 'Error creating subscription' });
  } catch (e) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(suscrib);
};

module.exports.postSubscription = [auth.authentication, auth.authorizationCompany, subscribeToPlan];

const cancelSubscription = async (req, res) => {
  let cancellation;
  try {
    cancellation = await cancelSubscriptionToPlan(req.params.subscriptionId);
    if (!cancellation.status) return res.status(400).json({ message: 'Unsubscribe error' });
  } catch (e) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(cancellation);
};

module.exports.getCancelSubscription = [
  auth.authentication,
  auth.authorizationCompany,
  cancelSubscription,
];

module.exports.getPlans = async (req, res) => {
  let plans;
  let treatedPlans;
  try {
    plans = await listPlans();
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

const getCustomerById = async (req, res) => {
  let customer;
  try {
    customer = await payment.getCustomerById(req.params.customerId);
    if (customer.status === false) return res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    return res.status(503).json({ message: 'Service unavailable' });
  }
  return res.status(200).json(customer.data);
};

module.exports.getCustomer = [getCustomerById];
