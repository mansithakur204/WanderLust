const nodemailer = require("nodemailer");

let transporter = null;

function checkEnvStatus() {
  return {
    EMAIL_HOST: process.env.EMAIL_HOST ? "PRESENT" : "MISSING",
    EMAIL_PORT: process.env.EMAIL_PORT ? "PRESENT" : "MISSING",
    EMAIL_USER: process.env.EMAIL_USER ? "PRESENT" : "MISSING",
    EMAIL_PASS: process.env.EMAIL_PASS ? "PRESENT" : "MISSING",
    EMAIL_FROM: process.env.EMAIL_FROM ? "PRESENT" : "MISSING",
  };
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && user && pass) {
    const isSecure = port === 465;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      tls: {
        // Do not fail on invalid certs during dev if configured
        rejectUnauthorized: process.env.NODE_ENV === "production"
      }
    });
  }
  return transporter;
}

/**
 * Run diagnostic check on SMTP transport
 */
async function verifySmtpConnection() {
  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    return { configured: false, connected: false, error: "SMTP environment variables are incomplete or missing." };
  }

  try {
    await activeTransporter.verify();
    return { configured: true, connected: true, error: null };
  } catch (err) {
    return { configured: true, connected: false, error: err.message };
  }
}

/**
 * Send password reset email
 * @param {string} toEmail 
 * @param {string} resetUrl 
 */
async function sendResetEmail(toEmail, resetUrl) {
  const activeTransporter = getTransporter();

  const fromAddress = process.env.EMAIL_FROM || '"WanderLust Support" <no-reply@wanderlust.com>';
  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: "WanderLust Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your WanderLust account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${resetUrl}\n\n` +
          `This link will expire in 1 hour.\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #fe424d; text-align: center;">WanderLust</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your WanderLust account.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #fe424d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Your Password</a>
        </p>
        <p style="font-size: 0.9em; color: #666;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 0.85em; color: #fe424d; word-break: break-all;">${resetUrl}</p>
        <p style="font-size: 0.85em; color: #888;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  if (activeTransporter) {
    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`[Mailer] Password reset email accepted by SMTP server for ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } else {
    // Development fallback logging when SMTP env vars are not set
    console.log(`\n==================================================`);
    console.log(`[SMTP CONFIG MISSING] Password reset email generated.`);
    console.log(`To: ${toEmail}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Configure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env to send real emails.`);
    console.log(`==================================================\n`);
    throw new Error("SMTP service is not configured. Real email could not be sent.");
  }
}

module.exports = { sendResetEmail, verifySmtpConnection, checkEnvStatus };
