import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must contain at least 6 characters." });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful.",
      membershipId: user.membershipId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while registering." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipId: user.membershipId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while logging in." });
  }
});

router.post(
  "/create-user",
  authMiddleware,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (
        !name?.trim() ||
        !email?.trim() ||
        !password ||
        !["admin", "member"].includes(role)
      ) {
        return res
          .status(400)
          .json({ message: "Please provide valid user details and role." });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res
          .status(400)
          .json({ message: "Please provide a valid email." });
      }
      if (password.length < 6)
        return res
          .status(400)
          .json({ message: "Password must contain at least 6 characters." });
      if (await User.findOne({ email: email.toLowerCase() })) {
        return res
          .status(400)
          .json({ message: "Email is already registered." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      });
      res.status(201).json({
        message: "User created successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          membershipId: user.membershipId,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error while creating user." });
    }
  },
);

router.get(
  "/users",
  authMiddleware,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Could not fetch users." });
    }
  },
);

export default router;
