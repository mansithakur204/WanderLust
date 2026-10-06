const mongoose = require("mongoose");
const Listing = require("../models/listing");
require("dotenv").config({ path: "../.env" });

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB for category update");

  const listings = await Listing.find({
    $or: [{ category: { $exists: false } }, { category: null }, { category: "" }]
  });

  console.log(`Found ${listings.length} listings missing category.`);

  const categories = [
    "Trending", "Rooms", "Iconic Cities", "Mountains", "Castles",
    "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats", "Beach"
  ];

  for (let listing of listings) {
    let assignedCategory = "Trending";
    const text = ((listing.title || "") + " " + (listing.description || "")).toLowerCase();

    if (text.includes("beach") || text.includes("ocean") || text.includes("sea") || text.includes("coast")) {
      assignedCategory = "Beach";
    } else if (text.includes("mountain") || text.includes("cabin") || text.includes("alpine") || text.includes("hill")) {
      assignedCategory = "Mountains";
    } else if (text.includes("castle") || text.includes("fort") || text.includes("chateau") || text.includes("palace")) {
      assignedCategory = "Castles";
    } else if (text.includes("pool") || text.includes("villa") || text.includes("resort")) {
      assignedCategory = "Amazing Pools";
    } else if (text.includes("camp") || text.includes("tent") || text.includes("glamping")) {
      assignedCategory = "Camping";
    } else if (text.includes("farm") || text.includes("barn") || text.includes("ranch") || text.includes("countryside")) {
      assignedCategory = "Farms";
    } else if (text.includes("city") || text.includes("loft") || text.includes("apartment") || text.includes("downtown")) {
      assignedCategory = "Iconic Cities";
    } else if (text.includes("room") || text.includes("bed") || text.includes("suite")) {
      assignedCategory = "Rooms";
    } else if (text.includes("boat") || text.includes("yacht") || text.includes("houseboat")) {
      assignedCategory = "Boats";
    } else if (text.includes("snow") || text.includes("arctic") || text.includes("ice")) {
      assignedCategory = "Arctic";
    }

    listing.category = assignedCategory;
    await listing.save();
    console.log(`Updated "${listing.title}" -> ${assignedCategory}`);
  }

  console.log("Migration complete!");
  mongoose.connection.close();
}

main().catch((err) => {
  console.error("Migration error:", err);
});
