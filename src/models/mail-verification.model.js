const mongoose = require('mongoose');

const mailVerificationSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    default: null,
    unique: true,
  },
  verificationToken: {
    type: String,
    required: false,
    default: null,
  },
  isLive: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MailVerification', mailVerificationSchema);
