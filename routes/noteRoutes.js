const express = require("express");
const noteController = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Correct import

const router = express.Router();

// Routes with authentication middleware
router.get("/", authMiddleware, noteController.getNotes);
router.post("/", authMiddleware, noteController.createNote);
router.delete("/:id", authMiddleware, noteController.deleteNote);

// Route without authentication (e.g., for admin)
router.get("/all",authMiddleware, noteController.getAllNotes);
router.put("/:id", authMiddleware, noteController.updateNote);
router.get("/search", authMiddleware, noteController.searchNotes);

module.exports = router;
