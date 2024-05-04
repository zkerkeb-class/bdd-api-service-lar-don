const { default: axios } = require('axios');
require('dotenv').config();
const notificationUrl = process.env.MAILING_API;
const MailVerification = require('../models/mail-verification.model');

exports.mailSendConfirmation = async (user) => {
  const mailVerificationExists = await MailVerification.findOne({
    email: user.email,
  });

  if (mailVerificationExists) {
    if (mailVerificationExists.isLive) {
      return {
        message: 'Ce mail a déjà été confirmé.',
      };
    } else {
      if (
        new Date(mailVerificationExists.createdAt).getTime() <
        new Date().getTime() - 600000
      ) {
        await MailVerification.findByIdAndDelete(
          mailVerificationExists._id
        ).catch((error) => {
          console.error(
            'Erreur lors de la suppression de MailVerification',
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

      const mailVerification = new MailVerification({
        email: data.email,
        verificationToken: data.token,
        isLive: false,
      });

      await mailVerification.save().catch((error) => {
        console.error(
          "Erreur lors de l'enregistrement de MailVerification",
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

exports.smsSendConfirmation = async (user) => {
  if (!user.phoneNumber) return console.error('Pas de numéro de téléphone');

  return await axios
    .post(`${notificationUrl}/sms/send-sms`, {
      phoneNumber: user.phoneNumber,
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
