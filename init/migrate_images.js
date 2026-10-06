const mongoose = require("mongoose");
const Listing = require("../models/listing");
require("dotenv").config({ path: "../.env" });

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB for Sprint 3 schema migration");

  const listings = await Listing.find({});
  console.log(`Auditing ${listings.length} existing listings...`);

  let updatedCount = 0;
  for (let listing of listings) {
    let modified = false;

    // Migrate single image object into images array if images is empty
    if ((!listing.images || listing.images.length === 0) && listing.image && listing.image.url) {
      listing.images = [{ url: listing.image.url, filename: listing.image.filename || "legacy_image" }];
      modified = true;
    }

    // Default property details if missing
    if (!listing.propertyType) {
      listing.propertyType = "Villa";
      modified = true;
    }
    if (!listing.maxGuests) {
      listing.maxGuests = 4;
      modified = true;
    }
    if (!listing.bedrooms) {
      listing.bedrooms = 2;
      modified = true;
    }
    if (!listing.beds) {
      listing.beds = 2;
      modified = true;
    }
    if (!listing.bathrooms) {
      listing.bathrooms = 1;
      modified = true;
    }
    if (!listing.amenities || listing.amenities.length === 0) {
      listing.amenities = ["WiFi", "Air Conditioning", "Free Parking", "Kitchen"];
      modified = true;
    }

    if (modified) {
      await listing.save();
      updatedCount++;
    }
  }

  console.log(`Migration complete! Successfully updated ${updatedCount} listings.`);
  mongoose.connection.close();
}

main().catch((err) => {
  console.error("Migration error:", err);
});
