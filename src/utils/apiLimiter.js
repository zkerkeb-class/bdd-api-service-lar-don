const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: 429,
    message: 'Trop de requêtes, veuillez réessayer dans une minute',
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports.default = apiLimiter;
