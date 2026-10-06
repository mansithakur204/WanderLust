const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsyc");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

// Listing-nested booking creation
router.post("/listings/:listingId/book", isLoggedIn, wrapAsync(bookingController.createBooking));

// User trips / My Bookings
router.get("/bookings", isLoggedIn, wrapAsync(bookingController.getUserBookings));

// Booking details
router.get("/bookings/:bookingId", isLoggedIn, wrapAsync(bookingController.getBookingDetails));

// Cancel booking
router.post("/bookings/:bookingId/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
