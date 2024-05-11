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

// userSchema.path('phoneNumber').validate(async function (value) {
//   const phoneNumberCount = await mongoose.models.User.countDocuments({
//     phoneNumber: value,
//   });
//   const phoneNumberRegex = /^33\d{9}$/; // Regex to validate the format
//   const isValidFormat = phoneNumberRegex.test(value);
//   return !phoneNumberCount && isValidFormat; // Validation succeeds if no other entry with the same phone number is found and the format is valid
// }, 'Ce numéro de téléphone est déjà utilisé ou le format est incorrect.');

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
