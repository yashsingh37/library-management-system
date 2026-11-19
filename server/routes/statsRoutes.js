import express from "express";
import Book from "../models/Book.js";
import User from "../models/User.js";
import Issue from "../models/Issue.js";
import authMiddleware from "../middleware/auth.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

router.get("/", authMiddleware, authorizeRole("admin"), async (req, res) => {
  try {
    const [books, issued, overdue, members] = await Promise.all([
      Book.countDocuments(),
      Issue.countDocuments({ status: "issued" }),
      Issue.countDocuments({ status: "issued", dueDate: { $lt: new Date() } }),
      User.countDocuments({ role: "member" }),
    ]);
    res.json({ books, issued, overdue, members });
  } catch (error) {
    res.status(500).json({ message: "Could not load dashboard statistics." });
  }
});

export default router;
