const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//register router
router.post("/register", async (req, res) => {
  const { username, password, confirmpwd, phone } = req.body;

  const userData = await User.find({ username: username });

  // Check if the user already exists
  if (userData.length > 0) {
    return res.status(409).json({ error: "User already exists" });
  }
  // Check if the password and confirmPassword match
  if (password !== confirmpwd) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  try {
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user data to the MongoDB collection
    const newUser = new User({
      username,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error while registering user:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

//login router
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign({ userId: user._id }, "mysecret", {
        expiresIn: "1d",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        username: user.username, 
        image: user.image, 
      });
    } else {
      return res.status(401).json({ error: "Invalid password or username" });
    }
  } catch (error) {
    console.error("Error while logging in:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});


module.exports = router;
