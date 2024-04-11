const { default: axios } = require('axios');
require('dotenv').config();
const notificationUrl = process.env.MAILING_API;

exports.mailSendConfirmation = async (user) => {
  await axios
    .post(`${notificationUrl}/mail/send-confirm`, {
      user,
    })
    .then((response) => {
      console.info(`Mail de confirmation envoyé à ${user.email}`);
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoie de mail", error.response.data);
    });
};

exports.smsSendConfirmation = async (user) => {
  return await axios
    .post(`${notificationUrl}/sms/send-sms`, {
      phoneNumber: '33671794533',
      smsContent:
        "Votre compte viens d'être crée sur Lardon Services. " +
        `Penser à confirmer votre compte via votre adresse mail : ${user.email}`,
    })
    .then((response) => {
      console.info(`SMS de confirmation envoyé à ${user.phoneNumber}`);
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoie de mail", error.response.data);
    });
};
