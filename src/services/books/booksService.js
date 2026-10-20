const { getDominantColor } = require("../colorService");
const UserBook = require("../../models/UserBook");
const libraryService = require("../libraryService");
const UserLibrary = require("../../models/UserLibrary");

async function getLibrary(userId) {
  const library = await UserLibrary.findOne({
    user: userId,
  }).populate({
    path: "books",
    select: "title authors coverColor numberOfPages publishYear openLibraryId",
  });

  if (!library) {
    throw new Error("Library not found!");
  }

  const totalBooks = library.books.length;

  const booksRead = library.books.filter((book) => book.read === true).length;

  return {
    libraryName: library.libraryName,
    totalBooks: totalBooks,
    booksRead: booksRead,
    libraryId: library._id,
    caption: library.caption,
    books: library.books.map((book) => ({
      id: book._id,
      title: book.title,
      authors: book.authors,
      color: book.coverColor,
      numberOfPages: book.numberOfPages,
      publishYear: book.publishYear,
    })),
  };
}

async function deleteBook(userId, bookId) {
  try {
    const library = await libraryService.getLibrary(userId);
    if (library == null) {
      const error = new Error("Library not found!");
      error.statusCode = 404;
      throw error;
    }

    const bookExists = library.books.some((id) => id.toString() === bookId);

    if (!bookExists) {
      const error = new Error("Book not found in your library!");
      error.statusCode = 404;
      throw error;
    }

    // Remove the book ID from the library
    library.books = library.books.filter((id) => id.toString() !== bookId);

    await library.save();

    // Delete the actual UserBook document
    await UserBook.findByIdAndDelete(bookId);

    return {
      message: "Book deleted successfully!",
    };
  } catch (error) {
    throw error;
  }
}

async function addBook(bookId, read, caption, userId) {
  try {
    if (typeof bookId !== "string" || !bookId.trim()) {
      throw new Error("Book Id is required!");
    }
    //searchBooksById(id)
    const response = await searchBooksById(bookId);

    const bookData = response[0];

    if (bookData == null) {
      throw new Error("Book not found!");
    }

    //fetch the user library
    const library = await libraryService.getLibrary(userId);

    // 3. Check whether the book is already in the library
    await library.populate("books");

    const existingBook = library.books.find(
      (book) => book.openLibraryId === bookData.openLibraryId,
    );

    if (existingBook) {
      const error = new Error("Book already exists in your library!");
      error.statusCode = 409;
      throw error;
    }

    //give cover to getDominantColor
    const color = await getDominantColor(bookData.coverUrl);

    //set the data of book to custom model
    const book = await UserBook.create({
      read: read,
      coverColor: color,
      caption: caption,
      title: bookData.title,
      authors: bookData.authors,
      publishYear: bookData.publishYear,
      numberOfPages: bookData.numberOfPages,
      coverUrl: bookData.coverUrl,
      openLibraryId: bookId,
    });

    //push the book to users library
    library.books.push(book._id);
    await library.save();

    return book;
  } catch (error) {
    throw error;
  }
}

// get books by name
async function searchBooksByName(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Book name is required");
  }

  const url = new URL("https://openlibrary.org/search.json");

  url.searchParams.set("title", name.trim());
  url.searchParams.set("limit", "10");
  url.searchParams.set(
    "fields",
    "title,author_name,cover_i,number_of_pages_median,key,first_publish_year",
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.docs ?? []).map((book) => ({
    openLibraryId: book.key ?? null,
    title: book.title ?? "Unknown title",
    authors: book.author_name ?? [],
    publishYear: book.first_publish_year ?? null,
    numberOfPages: book.number_of_pages_median ?? null,
    coverUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
  }));
}
// get book by Id
async function searchBooksById(id) {
  if (id == null) {
    throw new Error("Book id is required");
  }

  const url = new URL(`https://openlibrary.org/search.json`);

  url.searchParams.set("q", `key:${id}`);
  url.searchParams.set("limit", "1");
  url.searchParams.set(
    "fields",
    "title,author_name,cover_i,number_of_pages_median,key,first_publish_year",
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.docs ?? []).map((book) => ({
    openLibraryId: book.key ?? null,
    title: book.title ?? "Unknown title",
    authors: book.author_name ?? [],
    publishYear: book.first_publish_year ?? null,
    numberOfPages: book.number_of_pages_median ?? null,
    coverUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
  }));
}

async function editLibraryCaption(caption, userId) {
  try {
    const library = await libraryService.getLibrary(userId);
    if (library == null) {
      const error = new Error("Library not found!");
      error.statusCode = 404;
      throw error;
    }

    library.caption = caption;
    await library.save();

    return {
      message: "caption edited successfully!",
    };
  } catch (error) {
    throw error;
  }
}

async function editBook(bookId, caption, read) {
  try {
    const book = await UserBook.findById(bookId);

    if (!book) {
      const error = new Error("Book not found!");
      error.statusCode = 404;
      throw error;
    }
    book.caption = caption;
    book.read = read;
    book.save();
    return {
      message: "book edited successfully!",
    };
  } catch (error) {
    throw error;
  }
}



async function getBook(bookId) {
  try {
    const book = await UserBook.findById(bookId);

    if (!book) {
      const error = new Error("Book not found!");
      error.statusCode = 404;
      throw error;
    }

    return {
      book,
    };
  } catch (error) {
    throw error;
  }
}
// get book Cover

module.exports = {
  searchBooksByName,
  searchBooksById,
  addBook,
  getLibrary,
  deleteBook,
  editLibraryCaption,
  editBook,
  getBook,
};
