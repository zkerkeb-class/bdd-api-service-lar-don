require('dotenv').config();
const paymentUrl = process.env.URL_PAYMENT;

exports.createCustomer = async (email) => {
  const response = await fetch(paymentUrl + '/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return response.json();
};
