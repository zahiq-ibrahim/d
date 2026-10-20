const mongoose = require("mongoose");

const userBookSchema = new mongoose.Schema(
  {

    read: {
        type: Boolean,
        default: false, 
    },
    
    coverColor: {
        type: String,
        default: "#ffffff",
    },

    caption: {
        type: String,
        
    },

    title: {
        type: String,
        required: true,
    },

    authors: {
      type: [String],
      required: true,
    },

    publishYear: {
      type: Number,
      required: true,
    },

    numberOfPages: {
      type: Number,
      required: true,
    },

    coverUrl: {
        type: String,
        required: true,
    },

    openLibraryId: {
      type: String,
      required: true,
    },
  },
);

module.exports = mongoose.model("UserBook", userBookSchema);
