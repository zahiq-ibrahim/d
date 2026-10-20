const express = require("express");
const booksController = require("../controllers/books/booksController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/name", booksController.searchBooksByName);
router.post("/id", booksController.searchBooksById);

router.post("/add-book",authMiddleware, booksController.addBook);
router.post("/get-library",authMiddleware, booksController.getLibrary);
router.delete("/remove-book", authMiddleware, booksController.deleteBook);
router.patch("/edit-library-caption", authMiddleware, booksController.editLibraryCaption);
router.patch("/edit-book", authMiddleware, booksController.editBook);
router.get("/get-book/:bookId", authMiddleware, booksController.getBook);

router.get("/get-library-url", authMiddleware, booksController.getLibraryUrl);

module.exports = router;