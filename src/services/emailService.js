
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(email, otp) {
  const expires = process.env.OTP_EXPIRES_MINUTES || 5;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Verify your email address",

      text: `Your verification code is ${otp}. It expires in ${expires} minutes.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px;">
          <h2>Email verification</h2>

          <p>Use this code to verify your email address:</p>

          <h1 style="letter-spacing: 6px; font-size: 32px;">
            ${otp}
          </h1>

          <p>This code expires in ${expires} minutes.</p>

          <p>If you did not request this code, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("OTP email sent successfully:", data.id);

    return data;
  } catch (error) {
    console.error("Email service error:", error.message);
    throw error;
  }
}

module.exports = {
  sendOtpEmail,
};
