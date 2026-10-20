const crypto = require("crypto");
const Otp = require("../../models/Otp");

//to hash the otp
function hashOtp(userId, otp) {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${otp}:${process.env.OTP_SECRET}`)
    .digest("hex");
}

//generate otp
async function generateOtp(userId, enforceCoolDown = false) {
  const existing = await Otp.findOne({ userId });

  if (
    enforceCoolDown &&
    existing &&
    Date.now() - existing.lastSentAt.getTime() < 60_000
  ) {
    throw createError("PLease wait before requesting another Otp", 429);
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60_000,
  );

  await Otp.findOneAndUpdate(
    { userId },
    {
      otpHash: hashOtp(userId, otp),
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
  return otp;
}

async function verifyOtp(userId, submittedOtp) {
  const challenge = await Otp.findOne({ userId });

  if (!challenge) {
    throw createError("Invalid or expired OTP", 400);
  }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    await Otp.deleteOne({ _id: challenge._id });
    throw createError("Invalid or expired OTP", 400);
  }
  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);

  if (challenge.attempts >= maxAttempts) {
    await Otp.deleteOne({ _id: challenge._id });
    throw createError("Too many incorrect attempts. Request a new OTP.", 429);
  }

  const expectedHash = hashOtp(userId, submittedOtp);
  const actualBuffer = Buffer.from(challenge.otpHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  const matches =
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer);

  if (!matches) {
    challenge.attempts += 1;

    if (challenge.attempts >= maxAttempts) {
      await challenge.deleteOne();
      throw createError("Too many incorrect attempts. Request a new OTP.", 429);
    }

    await challenge.save();
    throw createError("Invalid or expired OTP", 400);
  }

  await challenge.deleteOne();
}

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  generateOtp,
  verifyOtp,
};
