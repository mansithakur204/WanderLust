const crypto = require("crypto");
const User = require("../models/user");
const { validatePassword } = require("../utils/passwordValidator");
const { sendResetEmail } = require("../utils/mailer");

module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/signup");
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      req.flash("error", passValidation.message);
      return res.redirect("/signup");
    }

    const newUser = new User({ email, username });
    const registerredUser = await User.register(newUser, password);

    req.login(registerredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WanderLust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};

// ==================================================
// FORGOT & RESET PASSWORD CONTROLLERS
// ==================================================

module.exports.renderForgotPassword = (req, res) => {
  res.render("users/forgotPassword.ejs");
};

module.exports.forgotPassword = async (req, res) => {
  const { credential } = req.body;
  const genericSuccessMsg = "If an account with that email or username exists, a password reset link has been sent.";

  if (!credential || !credential.trim()) {
    req.flash("error", "Please enter your username or email address.");
    return res.redirect("/forgot-password");
  }

  const query = credential.includes("@")
    ? { email: credential.trim().toLowerCase() }
    : { username: credential.trim() };

  const user = await User.findOne(query);

  if (!user) {
    // Avoid account enumeration: show generic success message
    req.flash("success", genericSuccessMsg);
    return res.redirect("/forgot-password");
  }

  // Generate cryptographically secure token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
  await user.save();

  const protocol = req.protocol;
  const host = req.get("host");
  const resetUrl = `${protocol}://${host}/reset-password/${rawToken}`;

  try {
    await sendResetEmail(user.email, resetUrl);
    req.flash("success", genericSuccessMsg);
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.error("Error sending reset email:", err);
    req.flash("error", "There was an error sending the password reset email. Please try again.");
  }

  res.redirect("/forgot-password");
};

module.exports.renderResetPassword = async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or has expired.");
    return res.redirect("/forgot-password");
  }

  res.render("users/resetPassword.ejs", { token });
};

module.exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash("error", "Password reset token is invalid or has expired.");
    return res.redirect("/forgot-password");
  }

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect(`/reset-password/${token}`);
  }

  const passValidation = validatePassword(password);
  if (!passValidation.isValid) {
    req.flash("error", passValidation.message);
    return res.redirect(`/reset-password/${token}`);
  }

  // Use passport-local-mongoose's setPassword method for secure hashing
  await user.setPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.flash("success", "Your password has been successfully reset! You can now log in.");
  res.redirect("/login");
};