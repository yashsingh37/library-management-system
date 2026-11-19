import express from "express";
import Book from "../models/Book.js";
import User from "../models/User.js";
import Issue from "../models/Issue.js";
import authMiddleware from "../middleware/auth.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", authorizeRole("admin"), async (req, res) => {
  try {
    const { bookId, memberId } = req.body;
    if (!bookId || !memberId)
      return res.status(400).json({ message: "Book and member are required." });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found." });
    const member = await User.findById(memberId);
    if (!member || member.role !== "member")
      return res.status(404).json({ message: "Member not found." });

    if (book.availableCopies <= 0)
      return res.status(400).json({ message: "Book not available." });

    const activeIssues = await Issue.find({
      member: memberId,
      status: "issued",
    });
    if (activeIssues.length >= 3)
      return res.status(400).json({ message: "Issue limit reached." });

    const alreadyIssued = await Issue.findOne({
      book: bookId,
      member: memberId,
      status: "issued",
    });
    if (alreadyIssued)
      return res
        .status(400)
        .json({ message: "Already issued to this member." });

    const unpaidFine = await Issue.aggregate([
      { $match: { member: member._id, status: "returned" } },
      { $group: { _id: null, total: { $sum: "$fine" } } },
    ]);
    if ((unpaidFine[0]?.total || 0) > 100) {
      return res.status(400).json({
        message:
          "Member has unpaid fines exceeding Rs 100. Cannot issue a book.",
      });
    }

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 7);

    const issue = await Issue.create({
      book: bookId,
      member: memberId,
      issueDate,
      dueDate,
    });
    book.availableCopies -= 1;
    await book.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate("book", "title author")
      .populate("member", "name email membershipId");
    res
      .status(201)
      .json({ message: "Book issued successfully.", issue: populatedIssue });
  } catch (error) {
    res.status(500).json({ message: "Could not issue book." });
  }
});

router.put("/:id/return", authorizeRole("admin"), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue)
      return res.status(404).json({ message: "Issue record not found." });
    if (issue.status === "returned")
      return res
        .status(400)
        .json({ message: "This book has already been returned." });

    const returnDate = new Date();
    const lateDays = Math.max(
      0,
      Math.ceil((returnDate - issue.dueDate) / (1000 * 60 * 60 * 24)),
    );
    issue.returnDate = returnDate;
    issue.fine = lateDays * 5;
    issue.status = "returned";
    await issue.save();

    const book = await Book.findById(issue.book);
    if (book) {
      book.availableCopies = Math.min(
        book.totalCopies,
        book.availableCopies + 1,
      );
      await book.save();
    }

    const result = await Issue.findById(issue._id)
      .populate("book", "title author")
      .populate("member", "name email membershipId");
    res.json({
      message: "Book returned successfully.",
      fine: issue.fine,
      issue: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not return book." });
  }
});

router.get("/my", authorizeRole("member"), async (req, res) => {
  try {
    const issues = await Issue.find({ member: req.user._id })
      .populate("book", "title author isbn category")
      .sort({ issueDate: -1 });
    const totalFine = issues
      .filter((item) => item.status === "returned")
      .reduce((sum, item) => sum + item.fine, 0);
    res.json({ issues, totalFine });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch your issued books." });
  }
});

router.get("/overdue", authorizeRole("admin"), async (req, res) => {
  try {
    const issues = await Issue.find({
      status: "issued",
      dueDate: { $lt: new Date() },
    })
      .populate("book", "title author")
      .populate("member", "name email membershipId")
      .sort({ dueDate: 1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch overdue books." });
  }
});

router.get("/active", authorizeRole("admin"), async (req, res) => {
  try {
    const issues = await Issue.find({ status: "issued" })
      .populate("book", "title author")
      .populate("member", "name email membershipId")
      .sort({ issueDate: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch active issues." });
  }
});

export default router;
