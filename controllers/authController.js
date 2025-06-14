const User = require("../models/user"); // Ensure User model exists
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Signup Function
exports.signup = async (req, res) => {
   try {
    

    const { Username, email, password } = req.body;
    
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    

    // Save User
    user = new User({ Username, email, password: hashedPassword });
    
    await user.save();
    

    // Generate Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const Note = require("../models/Note"); // Import the Note model

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Retrieve User's Notes
    const notes = await Note.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({ 
      message: "Login successful", 
      token,
      user: { id: user._id, username: user.Username, email: user.email },
      notes // Send back the user’s saved notes
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    console.error("❌ Login error:", error);
  }
};











