const { default: axios } = require('axios');
require('dotenv').config();
const paymentUrl = process.env.URL_PAYMENT;

exports.createCustomer = async (email) => {
  return await axios
    .post(`${paymentUrl}/customers`, { email })
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
};

exports.createCustomerSession = async (stripeId) => {
  return await axios
    .post(`${paymentUrl}/customers/session`, { stripeId })
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
};

exports.getSubscription = async (customerId) => {
  return await axios
    .get(`${paymentUrl}/customers/${customerId}/subscription`)
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
};
