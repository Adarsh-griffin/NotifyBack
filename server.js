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
const aiRoutes = require ("./routes/aiRoutes")

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // or whatever your frontend URL is
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(fileUpload()); // Add file upload middleware

// Routes
app.use("/api/enhance-text",aiRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ocr", ocrRoutes);



// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API is working correctly!" });
});

// Server setup
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));