const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsyc");
const { isLoggedIn } = require("../middleware");
const wishlistController = require("../controllers/wishlist");

router.get("/", isLoggedIn, wrapAsync(wishlistController.renderWishlist));

router.post("/toggle/:listingId", isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

router.route("/:listingId")
  .post(isLoggedIn, wrapAsync(wishlistController.toggleWishlist))
  .delete(isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;
