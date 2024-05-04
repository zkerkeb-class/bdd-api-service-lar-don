const { default: axios } = require('axios');
require('dotenv').config();
const notificationUrl = process.env.MAILING_API;
const TokenVerification = require('../models/token-verification.model');

exports.mailSendConfirmation = async (user) => {
  const tokenVerificationExists = await TokenVerification.findOne({
    email: user.email,
    type: 'confirm-email',
  });

  if (tokenVerificationExists) {
    if (tokenVerificationExists.isLive) {
      return {
        message: 'Ce mail a déjà été confirmé.',
      };
    } else {
      if (
        new Date(tokenVerificationExists.createdAt).getTime() <
        new Date().getTime() - 600000
      ) {
        await TokenVerification.findByIdAndDelete(
          tokenVerificationExists._id
        ).catch((error) => {
          console.error(
            'Erreur lors de la suppression de TokenVerification',
            error
          );
          throw error;
        });
      } else {
        return {
          message:
            'Un mail de confirmation a déjà été envoyé il y a moins de 10 minutes.',
        };
      }
    }
  }

  return await axios
    .post(`${notificationUrl}/mail/send-confirm`, {
      user,
    })
    .then(async (response) => {
      const data = response.data.data;

      const tokenVerification = new TokenVerification({
        email: data.email,
        verificationToken: data.token,
        isLive: false,
        type: 'confirm-email',
      });

      await tokenVerification.save().catch((error) => {
        console.error(
          "Erreur lors de l'enregistrement de TokenVerification",
          error
        );
        throw error;
      });

      return {
        message: 'Mail de confirmation envoyé',
      };
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoie de mail", error.response.data);
    });
};

exports.sendSms = async (phoneNumber, content) => {
  if (!phoneNumber) return console.error('Pas de numéro de téléphone');

  return await axios
    .post(`${notificationUrl}/sms/send-sms`, {
      phoneNumber: phoneNumber,
      smsContent: content,
    })
    .then((response) => {
      return { message: 'Sms envoyé', data: response.data };
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoie de mail", error.response.data);
    });
};
