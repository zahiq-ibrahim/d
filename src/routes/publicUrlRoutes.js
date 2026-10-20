const express = require("express");
const booksController = require("../controllers/books/booksController");

const router = express.Router();

router.get("/:userId", booksController.getPublicLibrary);

module.exports = router;