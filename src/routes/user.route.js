const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller")


//router.get(<path>,<controller>.<method>)
router.post("/",controller.createUser);
router.post("/login",controller.login);
router.post("/login-google",controller.handleGoogleUser);
router.get("/:id",controller.getUserById);
router.get("/",controller.getAll);
router.delete("/:id",controller.deleteUser);
router.put("/:id",controller.updateUser);
router.put('/confirm/:id',controller.confirm)
router.get('/:id/subscription',controller.getUserSubscription)

module.exports = router;


