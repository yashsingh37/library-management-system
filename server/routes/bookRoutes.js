import express from "express";
import Book from "../models/Book.js";
import authMiddleware from "../middleware/auth.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch books." });
  }
});

router.post("/", authorizeRole("admin"), async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies, shelfLocation } =
      req.body;
    if (
      !title?.trim() ||
      !author?.trim() ||
      !isbn?.trim() ||
      !category?.trim()
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required book fields." });
    }
    if (!Number.isInteger(Number(totalCopies)) || Number(totalCopies) < 1) {
      return res
        .status(400)
        .json({ message: "Total copies must be at least 1." });
    }
    if (await Book.findOne({ isbn: isbn.trim() })) {
      return res
        .status(400)
        .json({ message: "A book with this ISBN already exists." });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category: category.trim(),
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      shelfLocation: shelfLocation || "",
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Could not add book." });
  }
});

router.put("/:id", authorizeRole("admin"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    const { title, author, isbn, category, totalCopies, shelfLocation } =
      req.body;
    if (
      !title?.trim() ||
      !author?.trim() ||
      !isbn?.trim() ||
      !category?.trim()
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required book fields." });
    }
    const newTotal = Number(totalCopies);
    if (
      !Number.isInteger(newTotal) ||
      newTotal < 1 ||
      newTotal < book.totalCopies - book.availableCopies
    ) {
      return res.status(400).json({
        message:
          "Total copies cannot be less than the number of books currently issued.",
      });
    }
    const duplicate = await Book.findOne({
      isbn: isbn.trim(),
      _id: { $ne: book._id },
    });
    if (duplicate)
      return res
        .status(400)
        .json({ message: "Another book already uses this ISBN." });

    book.title = title.trim();
    book.author = author.trim();
    book.isbn = isbn.trim();
    book.category = category.trim();
    book.shelfLocation = shelfLocation || "";
    book.availableCopies = newTotal - (book.totalCopies - book.availableCopies);
    book.totalCopies = newTotal;
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Could not update book." });
  }
});

router.delete("/:id", authorizeRole("admin"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });
    if (book.availableCopies !== book.totalCopies) {
      return res
        .status(400)
        .json({ message: "Book currently issued. It cannot be deleted." });
    }
    await book.deleteOne();
    res.json({ message: "Book deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete book." });
  }
});

export default router;
