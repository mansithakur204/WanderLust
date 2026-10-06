const Listing = require("../models/listing");
const Wishlist = require("../models/wishlist");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let { search, category, sort } = req.query;
  let dbQuery = {};

  if (search && search.trim() !== "") {
    const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(cleanSearch, "i");
    dbQuery.$or = [
      { title: searchRegex },
      { location: searchRegex },
      { country: searchRegex },
      { category: searchRegex },
    ];
  }

  if (category && category.trim() !== "") {
    const cleanCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    dbQuery.category = new RegExp(`^${cleanCategory}$`, "i");
  }

  let sortOption = { _id: -1 };
  if (sort === "price_asc") {
    sortOption = { price: 1 };
  } else if (sort === "price_desc") {
    sortOption = { price: -1 };
  }

  const allListings = await Listing.find(dbQuery).sort(sortOption);

  let savedListingIds = new Set();
  if (req.user) {
    const userWishlist = await Wishlist.findOne({ user: req.user._id });
    if (userWishlist && userWishlist.listings) {
      userWishlist.listings.forEach((id) => savedListingIds.add(id.toString()));
    }
  }

  res.render("listings/index.ejs", {
    allListings,
    savedListingIds,
    search: search ? search.trim() : "",
    category: category ? category.trim() : "",
    sort: sort ? sort.trim() : "",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let isFavorite = false;
  if (req.user) {
    const userWishlist = await Wishlist.findOne({ user: req.user._id });
    if (userWishlist && userWishlist.listings) {
      isFavorite = userWishlist.listings.some((favId) => favId.toString() === listing._id.toString());
    }
  }

  res.render("listings/show.ejs", { listing, isFavorite });
};


module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.files && req.files.length > 0) {
    const imageList = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    newListing.images = imageList;
    newListing.image = imageList[0];
  }

  if (response.body.features && response.body.features.length > 0) {
    newListing.geometry = response.body.features[0].geometry;
  }

  let savedListing = await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = "";
  if (listing.images && listing.images.length > 0) {
    originalImageUrl = listing.images[0].url;
  } else if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url;
  }
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));

    if (!listing.images) {
      listing.images = [];
    }
    listing.images.push(...newImages);
    if (!listing.image || !listing.image.url) {
      listing.image = listing.images[0];
    }
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

