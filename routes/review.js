const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsyc");
const ExpressError = require("../utils/expressError.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {
  isReviewAuthor,
  validateReview,
  isLoggedIn,
} = require("../middleware.js");

const reviewConroller = require("../controllers/reviews.js");

// Post review route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewConroller.createReview),
);

// Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewConroller.destroyReview),
);

module.exports = router;
