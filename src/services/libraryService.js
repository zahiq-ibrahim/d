const User = require("../models/User");
const { eventNames } = require("../models/UserBook");
const UserLibrary = require("../models/UserLibrary");

async function getLibrary(userId) {
  try {
    const user = await User.findById(userId).select(
      "email isEmailVerified createdAt",
    );

    if (!user) {
      const error = new Error("user not found!");
      error.statusCode = 404;
      throw error;
    }

    const library = await UserLibrary.findOne({
      user: userId,
    });

    return library;
  } catch (error) {
    throw error;
  }
}

async function getLibraryUrl(userId) {
  try {
    const user = await User.findById(userId).select(
      "email isEmailVerified createdAt",
    );

    if (!user) {
      const error = new Error("user not found!");
      error.statusCode = 404;
      throw error;
    }

    const url = `${process.env.APP_URL}/library/${userId}`;

    // const library = await UserLibrary.findOne({
    //   user: userId,
    // });

    return url;
  } catch (error) {
    throw error;
  }
}

module.exports = { getLibrary, getLibraryUrl };
