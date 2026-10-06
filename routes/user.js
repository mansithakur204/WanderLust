const express = require("express");
const router = express.Router();
const wrapAsyc = require("../utils/wrapAsyc.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
  .get(userController.renderSignup)
  .post(wrapAsyc(userController.signup));

router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

// Password Reset Routes
router.route("/forgot-password")
  .get(userController.renderForgotPassword)
  .post(wrapAsyc(userController.forgotPassword));

router.route("/reset-password/:token")
  .get(wrapAsyc(userController.renderResetPassword))
  .post(wrapAsyc(userController.resetPassword));

module.exports = router;
