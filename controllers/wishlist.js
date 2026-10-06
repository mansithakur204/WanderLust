const Wishlist = require("../models/wishlist");
const Listing = require("../models/listing");

module.exports.renderWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("listings");
  
  let validListings = [];
  let savedListingIds = new Set();

  if (wishlist && wishlist.listings) {
    validListings = wishlist.listings.filter((item) => item !== null);
    validListings.forEach((item) => savedListingIds.add(item._id.toString()));
  }

  res.render("users/wishlist.ejs", {
    listings: validListings,
    savedListingIds,
  });
};

module.exports.toggleWishlist = async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({
      success: false,
      error: "Listing does not exist",
    });
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, listings: [] });
    await wishlist.save();
  }

  const isSaved = wishlist.listings.some((id) => id.toString() === listingId.toString());

  if (isSaved) {
    wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { listings: listingId } },
      { new: true }
    );
    return res.json({
      success: true,
      saved: false,
      count: wishlist ? wishlist.listings.length : 0,
      message: "Removed from wishlist",
    });
  } else {
    wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { listings: listingId } },
      { new: true, upsert: true }
    );
    return res.json({
      success: true,
      saved: true,
      count: wishlist ? wishlist.listings.length : 0,
      message: "Added to wishlist",
    });
  }
};
