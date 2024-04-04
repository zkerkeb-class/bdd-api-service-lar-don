const User = require('../models/user.model');
const { createCustomer } = require('./payment.controller');

/* CREATE */
exports.createUser = async (req, res) => {
  const { email, username, password, isAdmin } = req.body;

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
            stripeId: customerId,
          };
          const newUser = new User(userData);
          const savedUser = await newUser.save();
          resolve(savedUser);
        })
        .catch((error) => reject(error));
    });

    return res.status(201).json(user);

    // const customerId = await createCustomer(email);
    // console.log(customerId);
    // const newUser = new User({
    //   email,
    //   username,
    //   password, // TODO : Hachage de mot de passe à prévoir
    //   isAdmin,
    //   customerId,
    // });

    // const savedUser = await newUser.save();
    // console.log(savedUser);
    // return res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Erreur lors de la création du user' });
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
        return res.status(200).json({ message: 'Connexion réussie', user });
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
