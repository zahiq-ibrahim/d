const { body, validationResult } = require("express-validator");

const signupValidation = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),

  body("password")
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8–72 characters long"),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),

  body("password").isString().notEmpty().withMessage("Password is required"),
];

const resetPasswordValidation = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
];

const verifyOtpValidation = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),

  body("otp")
    .isString()
    .matches(/^\d{6}$/)
    .withMessage("OTP must contain exactly 6 digits"),
];

const resendOtpValidation = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
];

const resetValidation = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),

  body("otp")
    .isString()
    .matches(/^\d{6}$/)
    .withMessage("OTP must contain exactly 6 digits"),

  body("newPassword")
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8–72 characters long"),
];

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
}

module.exports = {
  signupValidation,
  loginValidation,
  verifyOtpValidation,
  resendOtpValidation,
  resetPasswordValidation,
  resetValidation,
  validateRequest,
};
