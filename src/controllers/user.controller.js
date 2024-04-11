const User = require('../models/user.model');
const {
  createCustomer,
  createCustomerSession,
} = require('./payment.controller');
const axios = require('axios');

/* CREATE */
exports.createUser = async (req, res) => {
  const { email, username, password, isAdmin, phoneNumber } = req.body;

  try {
    // check if username or email already exists in the database
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return res.status(400).json({
        message: 'Un utilisateur utilisant le même nom ou email existe déjà.',
      });
    }

    const user = await new Promise((resolve, reject) => {
      createCustomer(email)
        .then(async (customerId) => {
          const userData = {
            email,
            username,
            password,
            isAdmin,
            phoneNumber,
            stripeId: customerId,
          };
          const newUser = new User(userData);
          const savedUser = await newUser.save();
          await axios.post(`${process.env.MAILING_API}/mail/send-confirm`,
              {
                user:newUser
              })
              .then(response => {
                console.log(response.data)
              })
              .catch(error => {
                console.error('Erreur lors de l\'envoie de mail', error.response.data);
              })
          await axios.post(`${process.env.MAILING_API}/sms/send-sms`,
              {
                phoneNumber:"33671794533",//newUser.phoneNumber,
                smsContent:"Votre compte viens d\'être crée sur Lardon Services. " +
                    `Penser à confirmer votre compte via votre adresse mail : ${newUser.email}`
              })
              .then(response => {
                console.log(response.data)
              })
              .catch(error => {
                console.error('Erreur lors de l\'envoie de mail', error.response.data);
              })
          resolve(savedUser);
        })
        .catch((error) => reject(error));
    });


    return res.status(201).json(user);
  } catch (error) {
    return res
      .status(500)
      .json(error);
  }
};

/* GET */

exports.getAll = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
};

exports.login = async (req, res) => {
  try {
    const usernameOrEmail = req.body.usernameOrEmail;
    const password = req.body.password;

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (user) {
      const passwordMatch = await user.comparePassword(password);

      if (passwordMatch) {
        createCustomerSession(user.stripeId)
          .then(async (customerSecretId) => {
            return res.status(200).json({ user, customerSecretId });
          })
          .catch((error) => {
            return res.status(500).json({
              message: 'Erreur lors de la création de la session customer',
              error,
            });
          });
      } else {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
    } else {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
};

/* UPDATE */

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, password },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

/* DELETE */

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res
      .status(200)
      .json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
};

exports.confirm = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(userId, { $set: { live: true }}, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res
        .status(200)
        .json({ message: 'Votre compte à bien été confirmer' });
  } catch (error) {
    console.error(error);
    return res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
};
