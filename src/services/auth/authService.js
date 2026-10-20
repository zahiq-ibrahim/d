const bcrypt = require("bcrypt");
const User = require("../../models/User");
const { generateOtp, verifyOtp } = require("../../services/otp/otpService");
const { sendOtpEmail } = require("../emailService");
const { generateToken } = require("./jwtService");
const UserLibrary = require("../../models/UserLibrary");

async function signup(email, password, userName) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw createError(
      existingUser.isEmailVerified
        ? "An account with this email already exists"
        : "Account registration is pending. Request a new OTP.",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    userName,
    email: normalizedEmail,
    passwordHash,
    isEmailVerified: false,
  });

  await UserLibrary.create({
    user: user._id,
    books: [],
    caption: "",
    libraryName: userName + "'s library",
  });

  const otp = await generateOtp(user._id);
  await sendOtpEmail(user.email, otp);

  return {
    userId: user._id,
    email: user.email,
    userName: user.userName,
    message: "An otp has been sent to your email.",
  };
}

async function verifyEmail(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw createError("Invalid or expired OTP", 400);
  }

  if (user.isEmailVerified) {
    throw createError("Email is already verified", 400);
  }

  await verifyOtp(user._id, otp);

  user.isEmailVerified = true;
  await user.save();

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      email: user.email,
    },
    token,
  };
}

async function resetPasswordRequest(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw createError("User does not exist!", 404);
  }

  const otp = await generateOtp(user._id, true);
  await sendOtpEmail(user.email, otp);

  return {
    message: "Password reset otp has been sent to your email.",
  };
}

async function resetPassword(email, otp, newPassword) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw createError("User does not exist!", 404);
  }

  await verifyOtp(user._id, otp);
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.passwordHash = hashedPassword;
  await user.save();

  return {
    message: "Password reset successfully.",
  };
}

async function resendOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user || user.isEmailVerified) {
    return {
      message: "If an unverified account exists, an OTP will be sent.",
    };
  }

  const otp = await generateOtp(user._id, false);
  await sendOtpEmail(user.email, otp);

  return {
    message: "If an unverified account exists, an OTP will be sent.",
  };
}

async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+passwordHash");

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw createError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    throw createError("Please verify your email before logging in", 403);
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      email: user.email,
    },
    token,
  };
}

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  signup,
  verifyEmail,
  resendOtp,
  login,
  resetPassword,
  resetPasswordRequest,
};
