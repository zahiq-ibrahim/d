const mongoose = require("mongoose");

const userLibrarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserBook",
    },
  ],

  libraryName: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("UserLibrary", userLibrarySchema);
