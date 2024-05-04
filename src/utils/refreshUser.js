const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

exports.refreshUser = async (email, res, message) => {
  const userData = await User.findOne({
    email: email,
  }).lean();
  return res.status(200).json({
    message: message || 'Succès',
    data: userData,
    token: jwt.sign(userData, process.env.JWT_SECRET),
  });
};
