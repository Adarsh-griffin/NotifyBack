

const express = require("express");
const { signup, login } = require("../controllers/authController");
const noteController = require("../controllers/noteController"); // ✅ Use full controller
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/notes", noteController.getAllNotes);
router.get("/search", authMiddleware, noteController.searchNotes); // ✅ No more error

module.exports = router;


