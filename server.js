const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
//import bodyParser from "body-parser";

const authRoutes = require("./routes/authRoutes"); // Ensure this file exists
const noteRoutes = require("./routes/noteRoutes")

const app = express();

app.use(express.json()); // ✅ Enable JSON body parsing
app.use(cors()); // ✅ Allow frontend requests

app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes);
//app.use("/api", deepseekRoutes); // Register the route


app.get("/api/test", (req, res) => {
    res.json({ message: "✅ API is working correctly!" });
});








const PORT = process.env.PORT || 5001;

// ✅ Updated MongoDB connection (no deprecated options)node 
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));
