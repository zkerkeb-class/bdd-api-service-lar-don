require('dotenv').config();
const paymentUrl = process.env.URL_PAYMENT;

exports.createCustomer = async (email) => {
  return await new Promise((resolve, reject) => {
    fetch(paymentUrl + '/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};
