const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    default: null,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    default: null,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    default: null,
    minLength: 8,
    maxLength: 300,
    select: false,
  },
  googleId: {
    type: String,
    required: false,
    default: null,
    select: false,
  },
  discordId: {
    type: String,
    required: false,
    default: null,
    select: false,
  },
  githubId: {
    type: String,
    required: false,
    default: null,
    select: false,
  },
  phoneNumber: {
    //Format type [indicatif][numero] : un numero français 33671794543
    type: String,
    required: false,
    trim: true,
    default: null,
  },
  stripeId: {
    type: String,
    required: false,
    default: null,
  },
  isLive: {
    type: Boolean,
    required: false,
    default: false,
  },
});

userSchema.path('email').validate(async function (value) {
  const emailCount = await mongoose.models.User.countDocuments({
    email: value,
  });
  return !emailCount; // La validation réussit si aucune autre entrée avec le même e-mail n'est trouvée
}, 'Cet e-mail est déjà utilisé.');

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
