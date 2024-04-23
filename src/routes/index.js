const express = require('express');
const router = express.Router();

const userRouter = require('./user.route');
const chatRouter = require('./chat.route');

router.use('/users', userRouter);
router.use('/chat', chatRouter);

module.exports = router;
