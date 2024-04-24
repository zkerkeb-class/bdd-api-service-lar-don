const express = require("express");
const router = express.Router();
const controller = require("../controllers/chat.controller")


//router.get(<path>,<controller>.<method>)
router.post("/",controller.create);
router.get("/all",controller.getAll);
router.get("/:id",controller.getOne);
router.delete("/:id",controller.delete);
router.put('/:id',controller.updateOne)

module.exports = router;


