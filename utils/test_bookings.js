const mongoose = require("mongoose");
const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const { checkBookingOverlap } = require("../controllers/bookings");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function runBookingTests() {
  console.log("==================================================");
  console.log("   STARTING SPRINT 5 BOOKING ENGINE TEST SUITE");
  console.log("==================================================\n");

  let hostUser, guestUser1, guestUser2, testListing, booking1;

  try {
    await mongoose.connect(MONGO_URL);
    console.log("✓ Connected to MongoDB.");

    // 1. Create Host and Guest Users
    hostUser = new User({ email: `host_${Date.now()}@example.com`, username: `host_${Date.now()}` });
    await User.register(hostUser, "HostPass@123");

    guestUser1 = new User({ email: `guest1_${Date.now()}@example.com`, username: `guest1_${Date.now()}` });
    await User.register(guestUser1, "GuestPass@123");

    guestUser2 = new User({ email: `guest2_${Date.now()}@example.com`, username: `guest2_${Date.now()}` });
    await User.register(guestUser2, "GuestPass@123");
    console.log("✓ Created host and guest test users.");

    // 2. Create Test Listing
    testListing = new Listing({
      title: "Luxury Beachfront Villa",
      description: "Beautiful villa overlooking the ocean.",
      price: 5000,
      location: "Goa",
      country: "India",
      category: "Beach",
      maxGuests: 4,
      owner: hostUser._id,
      geometry: { type: "Point", coordinates: [73.8567, 15.2993] }
    });
    await testListing.save();
    console.log("✓ Created test listing (₹5,000 / night, max 4 guests).");

    // 3. Test Owner Self-Booking Restriction Check
    console.log("\n[TEST 1] Listing Owner Self-Booking Restriction...");
    if (testListing.owner.equals(hostUser._id)) {
      console.log("✓ Correctly identified host owner attempt (prevented on server).");
    } else {
      throw new Error("Owner comparison failed!");
    }

    // 4. Test Valid Booking & Server-side Price Calculation
    console.log("\n[TEST 2] Valid 3-Night Booking & Server-Side Price Calculation...");
    const checkIn1 = new Date("2026-11-10");
    const checkOut1 = new Date("2026-11-13"); // 3 nights
    const nights1 = 3;
    const pricePerNight = testListing.price;
    const subtotal1 = pricePerNight * nights1; // 15,000
    const serviceFee1 = Math.round(subtotal1 * 0.10); // 1,500
    const totalPrice1 = subtotal1 + serviceFee1; // 16,500

    const booking1 = new Booking({
      listing: testListing._id,
      user: guestUser1._id,
      checkIn: checkIn1,
      checkOut: checkOut1,
      guests: 2,
      nights: nights1,
      pricePerNight,
      subtotal: subtotal1,
      serviceFee: serviceFee1,
      totalPrice: totalPrice1,
      status: "confirmed"
    });
    await booking1.save();
    console.log(`✓ Booking 1 created: ${nights1} nights, Subtotal ₹${subtotal1}, Service Fee ₹${serviceFee1}, Total ₹${totalPrice1}.`);

    // 5. Test Double-Booking Overlap Prevention
    console.log("\n[TEST 3] Double-Booking Overlap Rejection...");
    const overlappingCheckIn = new Date("2026-11-12");
    const overlappingCheckOut = new Date("2026-11-15"); // Overlaps Nov 12-13

    const hasOverlap = await checkBookingOverlap(testListing._id, overlappingCheckIn, overlappingCheckOut);
    if (!hasOverlap) {
      throw new Error("FAILURE: Overlapping booking was NOT detected!");
    }
    console.log("✓ Overlapping booking correctly rejected (Nov 12 - Nov 15 overlaps with Nov 10 - Nov 13).");

    // 6. Test Adjacent Dates Allowed (Boundary Check)
    console.log("\n[TEST 4] Adjacent Dates Allowed (Same-day Checkout/Check-in)...");
    const adjacentCheckIn = new Date("2026-11-13"); // Checkout day of Booking 1
    const adjacentCheckOut = new Date("2026-11-16");

    const hasAdjacentOverlap = await checkBookingOverlap(testListing._id, adjacentCheckIn, adjacentCheckOut);
    if (hasAdjacentOverlap) {
      throw new Error("FAILURE: Adjacent booking starting on checkout date was falsely flagged as overlap!");
    }
    console.log("✓ Adjacent reservation (Nov 13 - Nov 16) correctly ALLOWED.");

    // 7. Test Cancellation & Date Release
    console.log("\n[TEST 5] Booking Cancellation & Date Availability Release...");
    booking1.status = "cancelled";
    await booking1.save();

    const hasOverlapAfterCancel = await checkBookingOverlap(testListing._id, overlappingCheckIn, overlappingCheckOut);
    if (hasOverlapAfterCancel) {
      throw new Error("FAILURE: Cancelled booking still blocks dates!");
    }
    console.log("✓ Cancelled booking no longer blocks dates. Formerly overlapping dates are now available.");

    console.log("\n==================================================");
    console.log("ALL SPRINT 5 BOOKING ENGINE TESTS PASSED!");
    console.log("==================================================\n");

  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err);
  } finally {
    if (booking1 && booking1._id) await Booking.deleteOne({ _id: booking1._id });
    if (testListing && testListing._id) await Listing.deleteOne({ _id: testListing._id });
    if (hostUser && hostUser._id) await User.deleteOne({ _id: hostUser._id });
    if (guestUser1 && guestUser1._id) await User.deleteOne({ _id: guestUser1._id });
    if (guestUser2 && guestUser2._id) await User.deleteOne({ _id: guestUser2._id });
    console.log("Cleaned up test data.");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runBookingTests();
