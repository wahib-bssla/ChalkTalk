const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("./jwtMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" }); //400 bad resquest
    }

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message }); //500 Internal Server Error
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ message: "Username or Password not correct" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ message: "Username or Password not correct" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 3600000,
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

  res.json({ message: "Logout successful" });
});

// gets user/jwt info
router.get("/protected", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    try {
      const user = await User.findOne({ _id: decoded.id });
      res.json({
        message: "Mbrok dkhlti",
        user: { ...decoded, username: user.username },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
});

//gha test, makhdmthach tal db
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});

module.exports = router;
