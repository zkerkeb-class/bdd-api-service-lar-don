const User = require('../models/user.model');
const MailVerification = require('../models/mail-verification.model');
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
require('dotenv').config();

/* REGISTER */
exports.register = async (req, res) => {
  // Vérifier si l'email existe déjà
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).send({
      error: 'email_already_exists',
      message: 'Cet email est déjà utilisé',
    });
  }

  // On crée un nouvel utilisateur
  const newUser = new User(req.body);
  newUser.password = bcrypt.hashSync(req.body.password, 10);
  const savedUser = await newUser.save();

  // On envoie un email et un SMS de confirmation
  await mailSendConfirmation(savedUser);
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
    return res
      .status(404)
      .json({ error: 'not_found', message: 'Utilisateur non trouvé' });
  }

  // Vérifier si le mot de passe est correct
  const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordIsValid) {
    return res
      .status(401)
      .json({ error: 'invalid_password', message: 'Mot de passe incorrect' });
  }

  // On renvoie un token
  const userData = await User.findOne({
    email: req.body.email,
  }).lean();
  return res.json({
    data: userData,
    token: jwt.sign(userData, process.env.JWT_SECRET),
  });
};

/* LOGIN VIA GOOGLE */
exports.loginGoogle = async (req, res) => {
  const { email, username, id } = req.body;

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    // Vérifier si l'utilisateur s'est déjà connecté par Google
    const user = await User.findOne({
      email: req.body.email,
      googleId: req.body.id,
    }).select('+googleId');

    if (user) {
      // On renvoie un token
      const userData = await User.findOne({
        email: req.body.email,
      }).lean();
      return res.json({
        data: userData,
        token: jwt.sign(userData, process.env.JWT_SECRET),
      });
    } else {
      // On met à jour l'utilisateur avec l'id Google
      await User.findByIdAndUpdate(
        emailExists._id,
        { googleId: req.body.id },
        { new: true }
      );

      // On renvoie un token
      const userData = await User.findOne({
        email: req.body.email,
      }).lean();
      return res.json({
        data: JSON.parse(userData),
        token: jwt.sign(JSON.parse(userData), process.env.JWT_SECRET),
      });
    }
  } else {
    const googleLoginReq = {
      ...req,
      body: {
        email,
        username,
        password: id,
        googleId: id,
      },
    };

    return this.register(googleLoginReq, res);
  }
};

/* LOGIN VIA DISCORD */
exports.loginDiscord = async (req, res) => {
  const { email, username, id } = req.body;

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    // Vérifier si l'utilisateur s'est déjà connecté par Discord
    const user = await User.findOne({
      email: req.body.email,
      discordId: req.body.id,
    }).select('+discordId');

    if (user) {
      // On renvoie un token
      const userData = await User.findOne({
        email: req.body.email,
      }).lean();
      return res.json({
        data: userData,
        token: jwt.sign(userData, process.env.JWT_SECRET),
      });
    } else {
      // On met à jour l'utilisateur avec l'id Discord
      await User.findByIdAndUpdate(
        emailExists._id,
        { discordId: req.body.id },
        { new: true }
      );

      // On renvoie un token
      const userData = await User.findOne({
        email: req.body.email,
      }).lean();
      return res.json({
        data: userData,
        token: jwt.sign(userData, process.env.JWT_SECRET),
      });
    }
  } else {
    const discordLoginReq = {
      ...req,
      body: {
        email,
        username,
        password: id,
        discordId: id,
      },
    };

    return this.register(discordLoginReq, res);
  }
};

/* LOGIN VIA GITHUB */
exports.loginGithub = async (req, res) => {
  const { email, username, id } = req.body;

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    // Vérifier si l'utilisateur s'est déjà connecté par Github
    const user = await User.findOne({
      email: req.body.email,
      githubId: req.body.id,
    }).select('+githubId');

    if (user) {
      // On renvoie un token
      const userData = await User.findOne({
        email: req.body.email,
      }).lean();
      return res.json({
        data: userData,
        token: jwt.sign(userData, process.env.JWT_SECRET),
      });
    } else {
      // On met à jour l'utilisateur avec l'id Github
      await User.findByIdAndUpdate(
        emailExists._id,
        { githubId: req.body.id },
        { new: true }
      );

      // On renvoie un token
      const userData = await User.findOne({
        email: req.body.email,
      }).lean();
      return res.json({
        data: userData,
        token: jwt.sign(userData, process.env.JWT_SECRET),
      });
    }
  } else {
    const githubLoginReq = {
      ...req,
      body: {
        email,
        username,
        password: id,
        githubId: id,
      },
    };

    return this.register(githubLoginReq, res);
  }
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

exports.confirmEmail = async (req, res) => {
  const token = req.params.token;

  const mailVerification = await MailVerification.findOneAndUpdate(
    { token: token },
    { isLive: true }
  ).catch((error) => {
    return res
      .status(500)
      .json({ message: 'Erreur lors de la confirmation du mail' });
  });

  const newUser = await User.findOneAndUpdate(
    { email: mailVerification.email },
    { isLive: true }
  ).catch((error) => {
    return res.status(500).json({ message: 'Erreur lors de la confirmation' });
  });

  if (!newUser || !mailVerification) {
    return res
      .status(404)
      .json({ message: 'Token de confirmation non trouvé.' });
  }

  if (req.user && req.user._id === newUser._id) {
    const userData = await User.findOne({
      email: mailVerification.email,
    }).lean();
    return res.status(200).json({
      message: 'Votre email a bien été confirmé',
      data: userData,
      token: jwt.sign(userData, process.env.JWT_SECRET),
    });
  } else {
    return res.status(200).json({ message: 'Votre email a bien été confirmé' });
  }
};

exports.sendConfirmEmail = async (req, res) => {
  const mailConfirmation = await mailSendConfirmation(req.user);

  return res.status(200).json(mailConfirmation);
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
