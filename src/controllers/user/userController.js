const User = require("../../models/User");
const UserLibrary = require("../../models/UserLibrary");

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId).select(
      "email isEmailVerified createdAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const library = await UserLibrary.findOne({
      user: req.auth.userId,
    });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        library:library,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMe };
