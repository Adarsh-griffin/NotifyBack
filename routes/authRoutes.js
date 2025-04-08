
const express = require("express");
const { signup, login } = require("../controllers/authController"); // Ensure this file exists
const { getAllNotes } = require("../controllers/noteController"); // Ensure this file exists
const router = express.Router();

// Signup Route ✅
router.post("/signup", signup);

// Login Route ✅
router.post("/login", login);

// Get All Notes Route ✅ (No authentication required)
router.get("/notes", getAllNotes);

router.get("/search", auth, noteController.searchNotes);

module.exports = router;

