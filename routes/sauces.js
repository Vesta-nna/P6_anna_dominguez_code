const express = require("express");
const router = express.Router();
const saucesController = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", auth, multer, saucesController.createThing);
router.post("/:id/like", auth, saucesController.likeThing);

router.put("/:id", auth, multer, saucesController.modifyThing);

router.delete("/:id", auth, saucesController.deleteThing);

router.get("/:id", auth, saucesController.getOneThing);
router.get("/", auth, saucesController.getAllThing);

module.exports = router;
