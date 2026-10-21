const booksService = require("../../services/books/booksService");
const libraryService = require("../../services/libraryService");

async function editLibraryCaption(req, res, next) {
  try {
    const response = await booksService.editLibraryCaption(
      req.body.caption,
      req.auth.userId,
    );
    return res.status(200).json({
      success: true,
      message: response,
    });
  } catch (error) {
    next(error);
  }
}

async function editBook(req, res, next) {
  try {
    const response = await booksService.editBook(
      req.body.bookId,
      req.body.caption,
      req.body.read,
    );
    return res.status(200).json({
      success: true,
      message: response,
    });
  } catch (error) {
    next(error);
  }
}

async function getLibrary(req, res, next) {
  try {
    const library = await booksService.getLibrary(req.auth.userId);

    return res.status(200).json({
      success: true,
      library,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteBook(req, res, next) {
  try {
    const response = await booksService.deleteBook(
      req.auth.userId,
      req.body.bookId,
    );

    return res.status(200).json({
      success: true,
      message: response,
    });
  } catch (error) {
    next(error);
  }
}

//booksService.searchBooksByName(bookName);

async function addBook(req, res, next) {
  try {
    const book = await booksService.addBook(
      req.body.bookId,
      req.body.haveRead,
      req.body.caption,
      req.auth.userId,
    );
    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

async function searchBooksByName(req, res, next) {
  try {
    const books = await booksService.searchBooksByName(req.body.bookName);
    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
}

async function searchBooksById(req, res, next) {
  try {
    const books = await booksService.searchBooksById(req.body.id);
    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
}

async function getBook(req, res, next) {
  try {
    const { bookId } = req.params;
    const book = await booksService.getBook(bookId);
    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
}

async function getLibraryUrl(req, res, next) {
  try {
    const userId = req.auth.userId;
    const url = await libraryService.getLibraryUrl(userId);
    return res.status(200).json({
      success: true,
      url: url,
    });
  } catch (error) {
    next(error);
  }
}




async function getPublicLibrary(req, res, next) {
  try {

     const library = await booksService.getLibrary(req.params.userId);

    return res.status(200).json({
      success: true,
      library,
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  searchBooksByName,
  searchBooksById,
  addBook,
  getLibrary,
  deleteBook,
  editLibraryCaption,
  editBook,
  getBook,
  getLibraryUrl,
  getPublicLibrary,
};
