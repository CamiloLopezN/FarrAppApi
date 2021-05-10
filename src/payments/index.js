const axios = require('axios');
const epayco = require('epayco-sdk-node')({
  apiKey: process.env.EPAYCO_PUBLIC_KEY,
  privateKey: process.env.EPAYCO_PRIVATE_KEY,
  lang: 'ES',
  test: true,
});

const URL_APIFY = 'https://apify.epayco.co';
const franchises = {
  AM: 'Amex',
  BA: 'Baloto',
  CR: 'Credencial',
  DC: 'Diners Club',
  EF: 'Efecty',
  GA: 'Gana',
  PR: 'Punto Red',
  RS: 'Red Servi',
  MC: 'Mastercard',
  PSE: 'PSE',
  SP: 'SafetyPay',
  VS: 'Visa',
};
module.exports.franchises = franchises;

const loginApify = async () => {
  const auth = `Basic ${Buffer.from(
    `${process.env.EPAYCO_PUBLIC_KEY}:${process.env.EPAYCO_PRIVATE_KEY}`,
  ).toString('base64')}`;
  const request = await axios.post(`${URL_APIFY}/login`, {}, { headers: { Authorization: auth } });
  return request.data.token;
};

module.exports.transactionDetails = async (referencePayco) => {
  const token = await loginApify();
  const referenceDetails = await axios({
    method: 'get',
    url: `https://secure.epayco.co/validation/v1/reference/${referencePayco}`,
  });
  const transactionDetails = await axios({
    method: 'get',
    url: `${URL_APIFY}/transaction/detail`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      filter: {
        referencePayco: referenceDetails.data.data.x_ref_payco,
      },
    }),
  });
  return transactionDetails.data.data;
};

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

module.exports.getPlan = (planId) => epayco.plans.get(planId);

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
