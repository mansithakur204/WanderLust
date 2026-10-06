const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    category: Joi.string().allow("", null),
    propertyType: Joi.string().allow("", null),
    maxGuests: Joi.number().min(1).allow("", null),
    bedrooms: Joi.number().min(0).allow("", null),
    beds: Joi.number().min(0).allow("", null),
    bathrooms: Joi.number().min(0).allow("", null),
    amenities: Joi.array().items(Joi.string()).allow(null),
    image: Joi.string().allow("", null),
    images: Joi.array().allow(null),
  }).required(),
});


module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required()
})


