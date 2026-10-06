const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "Iconic Cities",
      "Mountains",
      "Castles",
      "Amazing Pools",
      "Camping",
      "Farms",
      "Arctic",
      "Domes",
      "Boats",
      "Beach",
    ],
    default: "Trending",
  },
  propertyType: {
    type: String,
    enum: ["House", "Apartment", "Villa", "Cabin", "Cottage", "Hotel", "Guesthouse"],
    default: "Villa",
  },
  maxGuests: {
    type: Number,
    default: 4,
    min: 1,
  },
  bedrooms: {
    type: Number,
    default: 2,
    min: 0,
  },
  beds: {
    type: Number,
    default: 2,
    min: 0,
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: 0,
  },
  amenities: [
    {
      type: String,
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    const Wishlist = require("./wishlist");
    await Wishlist.updateMany(
      { listings: listing._id },
      { $pull: { listings: listing._id } }
    );
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;



