const epayco = require('epayco-sdk-node')({
  apiKey: process.env.EPAYCO_PUBLIC_KEY,
  privateKey: process.env.EPAYCO_PRIVATE_KEY,
  lang: 'ES',
  test: true,
});

module.exports.createToken = (cardNumber, cardExpYear, cardExpMonth, cardCVC) =>
  epayco.token.create({
    'card[number]': cardNumber,
    'card[exp_year]': cardExpYear,
    'card[exp_month]': cardExpMonth,
    'card[cvc]': cardCVC,
  });

module.exports.createCustomer = (
  cardToken,
  firstName,
  lastName,
  email,
  isDefaultCard,
  city,
  address,
  phone,
  cellPhone,
) =>
  epayco.customers.create({
    token_card: cardToken,
    name: firstName,
    last_name: lastName,
    email,
    default: isDefaultCard,
    // Optional parameters:
    // These parameters are important when validating the credit card transaction
    city,
    address,
    phone,
    cell_phone: cellPhone,
  });

module.exports.listCustomers = () => epayco.customers.list();

module.exports.listPlans = () => epayco.plans.list();

module.exports.getCustomerById = (customerId) => epayco.customers.get(customerId);

module.exports.subscribeCustomer = (planId, customerId, cardToken, docType, docNumber) =>
  epayco.subscriptions.create({
    id_plan: planId,
    customer: customerId,
    token_card: cardToken,
    doc_type: docType,
    doc_number: docNumber,
  });

module.exports.retrieveSubscription = (subscriptionId) => epayco.subscriptions.get(subscriptionId);

module.exports.cancelSubscriptionToPlan = (subscriptionId) =>
  epayco.subscriptions.cancel(subscriptionId);

module.exports.changeDefaultCard = (cardFranchise, cardToken, cardMask, customerId) =>
  epayco.customers.addDefaultCard({
    franchise: cardFranchise,
    token: cardToken,
    mask: cardMask,
    customer_id: customerId,
  });

module.exports.addCustomerCard = (cardToken, customerId) =>
  epayco.customers.addNewToken({
    token_card: cardToken,
    customer_id: customerId,
  });

module.exports.removeCustomerCard = (cardFranchise, cardMask, customerId) =>
  epayco.customers.delete({
    franchise: cardFranchise,
    mask: cardMask,
    customer_id: customerId,
  });
