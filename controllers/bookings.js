const Listing = require("../models/listing");
const Booking = require("../models/booking");

/**
 * Service fee calculation helper (10% of subtotal)
 */
function calculateFees(pricePerNight, nights) {
  const subtotal = Math.round(pricePerNight * nights);
  const serviceFee = Math.round(subtotal * 0.10);
  const totalPrice = subtotal + serviceFee;
  return { subtotal, serviceFee, totalPrice };
}

/**
 * Check if a listing has overlapping confirmed bookings for given checkIn and checkOut dates
 * Overlap condition: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
 */
async function checkBookingOverlap(listingId, checkInDate, checkOutDate, excludeBookingId = null) {
  const query = {
    listing: listingId,
    status: "confirmed",
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingOverlap = await Booking.findOne(query);
  return !!existingOverlap;
}

module.exports.createBooking = async (req, res) => {
  const { listingId } = req.params;
  const { checkIn, checkOut, guests } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // 1. Owner restriction check
  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own property.");
    return res.redirect(`/listings/${listingId}`);
  }

  // 2. Date parsing & Validation
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    req.flash("error", "Please select valid check-in and check-out dates.");
    return res.redirect(`/listings/${listingId}`);
  }

  if (checkInDate < today) {
    req.flash("error", "Check-in date cannot be in the past.");
    return res.redirect(`/listings/${listingId}`);
  }

  if (checkOutDate <= checkInDate) {
    req.flash("error", "Check-out date must be after check-in date.");
    return res.redirect(`/listings/${listingId}`);
  }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    req.flash("error", "Minimum booking duration is 1 night.");
    return res.redirect(`/listings/${listingId}`);
  }

  // 3. Guest validation
  const numGuests = parseInt(guests, 10);
  if (isNaN(numGuests) || numGuests < 1) {
    req.flash("error", "Guests must be at least 1.");
    return res.redirect(`/listings/${listingId}`);
  }

  const maxAllowedGuests = listing.maxGuests || 4;
  if (numGuests > maxAllowedGuests) {
    req.flash("error", `Guest count cannot exceed maximum allowed (${maxAllowedGuests}).`);
    return res.redirect(`/listings/${listingId}`);
  }

  // 4. Double-Booking Overlap Check
  const hasOverlap = await checkBookingOverlap(listingId, checkInDate, checkOutDate);
  if (hasOverlap) {
    req.flash("error", "Selected dates are unavailable due to an existing reservation. Please choose different dates.");
    return res.redirect(`/listings/${listingId}`);
  }

  // 5. Server-side Price Calculation
  const pricePerNight = listing.price || 0;
  const { subtotal, serviceFee, totalPrice } = calculateFees(pricePerNight, nights);

  // 6. Save Booking
  const newBooking = new Booking({
    listing: listingId,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: numGuests,
    nights,
    pricePerNight,
    subtotal,
    serviceFee,
    totalPrice,
    status: "confirmed",
  });

  await newBooking.save();

  req.flash("success", "Reservation confirmed! Have a great trip.");
  res.redirect(`/bookings/${newBooking._id}`);
};

module.exports.getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/index.ejs", { bookings });
};

module.exports.getBookingDetails = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate({
      path: "listing",
      populate: { path: "owner" },
    })
    .populate("user");

  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }

  // Authorization check: Only booking owner can view
  if (!booking.user._id.equals(req.user._id)) {
    req.flash("error", "You are not authorized to view this booking.");
    return res.redirect("/bookings");
  }

  res.render("bookings/show.ejs", { booking });
};

module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }

  // Authorization check: Only booking owner can cancel
  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You are not authorized to cancel this booking.");
    return res.redirect("/bookings");
  }

  if (booking.status === "cancelled") {
    req.flash("error", "This booking is already cancelled.");
    return res.redirect(`/bookings/${bookingId}`);
  }

  booking.status = "cancelled";
  await booking.save();

  req.flash("success", "Booking has been successfully cancelled.");
  res.redirect(`/bookings/${bookingId}`);
};

module.exports.checkBookingOverlap = checkBookingOverlap;
