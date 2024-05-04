const mongoose = require('mongoose');

const tokenVerificationSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    default: null,
    unique: function () {
      return {
        email: this.email,
        type: this.type,
      };
    },
  },
  verificationToken: {
    type: String,
    required: false,
    default: null,
  },
  type: {
    type: String,
    enum: ['confirm-email', 'reset-password'],
    required: true,
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

module.exports = mongoose.model('TokenVerification', tokenVerificationSchema);
