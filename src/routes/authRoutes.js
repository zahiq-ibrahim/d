const express = require("express");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/auth/authController");

const {
  signupValidation,
  loginValidation,
  verifyOtpValidation,
  resendOtpValidation,
  validateRequest,
  resetPasswordValidation,
  resetValidation,
} = require("../validators/authValidators");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/signup",
  authLimiter,
  signupValidation,
  validateRequest,
  authController.signup,
);

router.post(
  "/verify-otp",
  otpLimiter,
  verifyOtpValidation,
  validateRequest,
  authController.verifyEmail,
);

router.post(
  "/resend-otp",
  otpLimiter,
  resendOtpValidation,
  validateRequest,
  authController.resendOtp,
);

router.post(
  "/login",
  authLimiter,
  loginValidation,
  validateRequest,
  authController.login,
);

router.post(
  "/reset-password-request",
  authLimiter,
  resetPasswordValidation,
  validateRequest,
  authController.resetPasswordRequest,
);

router.post(
  "/reset-password",
  authLimiter,
  resetValidation,
  validateRequest,
  authController.resetPassword,
);

module.exports = router;
