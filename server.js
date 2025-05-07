const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUpload()); // Add file upload middleware

// Routes
app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/ai", aiRoutes); // Removed extra space in the path

// Proxy route for Hugging Face API
app.post("/api/ai/enhance-text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    res.status(500).json({
      error: "AI processing failed",
      details: error.message,
    });
  }
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API is working correctly!" });
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to NotifyBack API");
});

// Server setup
const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));
