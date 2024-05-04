const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');

//router.get(<path>,<controller>.<method>)
router.post('/', controller.register);
router.get(
  '/:id/customer-secret',
  controller.loginRequired,
  controller.getCustomerSecret
);
router.post('/login-google', controller.loginGoogle);
router.post('/login-discord', controller.loginDiscord);
router.post('/login-github', controller.loginGithub);
router.post('/login', controller.login);
router.get('/connected', controller.getConnectedUser);
router.get('/', controller.loginRequired, controller.getAll);
router.delete('/:id', controller.loginRequired, controller.deleteUser);
router.put('/:id', controller.loginRequired, controller.updateUser);
router.put('/:id/phone-number', controller.loginRequired, controller.updatePhoneNumber);
router.post('/:id/reset-password', controller.loginRequired, controller.resetPassword);
router.post('/:id/verify-reset-password', controller.loginRequired, controller.verifyResetPassword);
router.post('/confirm-email', controller.confirmEmail);
router.post(
  '/send-confirm-email',
  controller.loginRequired,
  controller.sendConfirmEmail
);
router.get(
  '/:id/subscription',
  controller.loginRequired,
  controller.getUserSubscription
);

module.exports = router;
