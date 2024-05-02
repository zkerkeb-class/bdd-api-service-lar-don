const User = require('../models/user.model');
const {
  createCustomer,
  createCustomerSession,
  getSubscription,
} = require('./payment.controller');
const {
  mailSendConfirmation,
  smsSendConfirmation,
} = require('./notif.controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* REGISTER */
exports.register = async (req, res) => {
  // Vérifier si l'email existe déjà
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).send({
      message: 'Cet email est déjà utilisé',
    });
  }

  // On crée un nouvel utilisateur
  const newUser = new User(req.body);
  newUser.password = bcrypt.hashSync(req.body.password, 10);
  const savedUser = await newUser.save();

  // On envoie un email et un SMS de confirmation
  // await mailSendConfirmation(savedUser);
  // await smsSendConfirmation(savedUser);

  // On crée un client stripe lié à notre application avec l'email de l'utilisateur
  await createCustomer(newUser.email)
    .then(async (customerId) => {
      // On met à jour l'id stripe de l'utilisateur
      savedUser.stripeId = customerId;
      await User.findByIdAndUpdate(savedUser._id, savedUser, { new: true });

      // On connecte l'utilisateur
      return this.login(req, res);
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
};

/* LOGIN */
exports.login = async (req, res) => {
  // Vérifier si l'utilisateur existe
  const user = await User.findOne({
    email: req.body.email,
  }).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Vérifier si le mot de passe est correct
  const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Mot de passe incorrect' });
  }

  // On renvoie un token
  const userData = {
    email: user.email,
    username: user.username,
    phoneNumber: user.phoneNumber,
    _id: user._id,
    stripeId: user.stripeId,
  };
  return res.json({
    data: userData,
    token: jwt.sign(userData, 'LARDON-SERVICES'),
  });
};

/* GET CONNECTED USER */
exports.getConnectedUser = function (req, res, next) {
  if (req.user) {
    res.send(req.user);
    next();
  } else {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

/* LOGIN REQUIRED */
exports.loginRequired = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Non autorisé' });
  }
};

exports.getCustomerSecret = async (req, res) => {
  // On récupère l'id de l'utilisateur
  const userId = req.params.id;

  // On récupère l'utilisateur
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // On crée une session stripe pour l'utilisateur
  await createCustomerSession(user.stripeId)
    .then((customerSecretId) => {
      return res.json({ customerSecretId });
    })
    .catch((error) => {
      return res.status(500).json({
        message: 'Erreur lors de la création de la session customer',
        error,
      });
    });
};

/* GET ALL */
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

/* GET BY ID */
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

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { live: true } },
      { new: true }
    );

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

/* HANDLE GOOGLE USER */
exports.handleGoogleUser = async (req, res) => {
  const { email, name } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const user = await new Promise((resolve, reject) => {
        createCustomer(email)
          .then(async (customerId) => {
            const newUser = new User({
              email,
              username: name, // Use Google name as username
              password: null, // No password for Google users
              phoneNumber: null, // Assuming phone number is not required
              isAdmin: false, // Adjust based on your business logic
              stripeId: customerId,
            });

            const savedUser = await newUser.save();

            // await mailSendConfirmation(savedUser);

            // await smsSendConfirmation(savedUser);

            await createCustomerSession(savedUser.stripeId)
              .then(async (customerSecretId) => {
                resolve({ user: savedUser, customerSecretId });
              })
              .catch((error) => {
                return res.status(500).json({
                  message: 'Erreur lors de la création de la session customer',
                  error,
                });
              });
          })
          .catch((error) => reject(error));
      });

      return res.status(201).json(user);
    } else {
      const user = await User.findOne({ email });

      createCustomerSession(newUser.stripeId)
        .then(async (customerSecretId) => {
          return res.status(200).json({ user: user, customerSecretId });
        })
        .catch((error) => {
          return res.status(500).json({
            message: 'Erreur lors de la création de la session customer',
            error,
          });
        });
    }
  } catch (error) {
    console.error('Database operation failed', error);
    res
      .status(500)
      .json({ message: 'Error processing Google user data', error });
  }
};

exports.getUserSubscription = async (req, res) => {
  try {
    getSubscription(req.params.id)
      .then((subscription) => {
        return res.status(200).json(subscription);
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Erreur lors de la récupération de l'abonnement",
          error,
        });
      });
  } catch (error) {
    console.error(error);
  }
};
