const nodemailer = require("nodemailer");
const { Resolver } = require("dns").promises;

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;

function createTransporter(host) {
  return nodemailer.createTransport({
    host,
    port: SMTP_PORT,
    secure: false,
    requireTLS: true,
    tls: { servername: SMTP_HOST }, // keeps the TLS certificate valid when connecting by IP
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  });
}

// Collect candidate IPs from the system DNS and from Google/Cloudflare DNS
async function getCandidateIps() {
  const ips = new Set();
  const resolvers = [null, ["8.8.8.8"], ["1.1.1.1"]]; // null = system default

  for (const servers of resolvers) {
    try {
      const resolver = new Resolver();
      if (servers) resolver.setServers(servers);
      (await resolver.resolve4(SMTP_HOST)).forEach((ip) => ips.add(ip));
    } catch (err) {
      console.warn(
        `DNS lookup (${servers ? servers[0] : "system"}) failed: ${err.code}`
      );
    }
  }

  // Last resort: let Nodemailer resolve the hostname itself
  return ips.size ? [...ips] : [SMTP_HOST];
}

async function sendWithRetry(mailOptions, rounds = 3) {
  let lastError;
  const tried = new Set();

  for (let round = 1; round <= rounds; round++) {
    const ips = await getCandidateIps();
    // Try IPs we haven't used yet first; if none are new, retry the known ones
    const fresh = ips.filter((ip) => !tried.has(ip));
    const queue = fresh.length ? fresh : ips;

    for (const ip of queue) {
      tried.add(ip);
      const transporter = createTransporter(ip);
      try {
        return await transporter.sendMail(mailOptions);
      } catch (err) {
        lastError = err;
        console.warn(`SMTP via ${ip} failed: ${err.code || err.message}`);
        // Wrong credentials won't be fixed by another IP
        if (err.code === "EAUTH") throw err;
      } finally {
        transporter.close();
      }
    }
  }

  throw lastError;
}

async function sendOtpEmail(email, otp) {
  const expires = process.env.OTP_EXPIRES_MINUTES || 5;

  await sendWithRetry({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Verify your email address",
    text: `Your verification code is ${otp}. It expires in ${expires} minutes.`,
    html: `
      <h2>Email verification</h2>
      <p>Use this code to verify your email address:</p>
      <h1 style="letter-spacing: 6px">${otp}</h1>
      <p>This code expires in ${expires} minutes.</p>
      <p>If you did not request this code, ignore this email.</p>
    `,
  });
}

module.exports = {
  sendOtpEmail,
};