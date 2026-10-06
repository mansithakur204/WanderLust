# 🏡 WanderLust

### An Airbnb-Inspired Full-Stack Vacation Rental Platform

WanderLust is a full-stack vacation rental web application inspired by modern property-booking platforms. It allows users to discover properties, search and filter listings, save favorites, view property galleries, leave reviews, explore locations on maps, and make database-backed reservations.

The project started as a learning project and has been extended into a portfolio-ready full-stack application with authentication, authorization, cloud image storage, geolocation, wishlist functionality, and a complete booking engine.

---

## 🌐 Live Demo

🚀 **Live Application:**  
https://wanderlust-01a2.onrender.com/listings

💻 **GitHub Repository:**  
https://github.com/mansithakur204/WanderLust

---

## ✨ Features

### 🏠 Listings

- Create, edit and delete property listings
- Property categories
- Search by destination, title and location
- Category filtering
- Price sorting
- Multiple property images
- Responsive property gallery
- Image lightbox
- Property type
- Maximum guests
- Bedrooms
- Beds
- Bathrooms
- Amenities
- Cloudinary image storage

---

### 🔎 Search & Discovery

- 🔍 Destination search
- 🗂️ Property category navigation
- 💰 Price sorting
- 🏠 Responsive property cards
- 📍 Mapbox location and map integration
- 📱 Mobile-friendly discovery experience

---

### ❤️ Wishlist & Favorites

- Save listings to a personal wishlist
- Favorite/unfavorite without page reload
- AJAX-based favorite interaction
- Dedicated Wishlist page
- Duplicate-safe wishlist entries
- Responsive wishlist UI
- Automatic cleanup when a listing is deleted
- Authentication-protected wishlist actions

---

### 🔐 Authentication & Security

- User registration
- Login and logout
- Session-based authentication
- Protected routes
- Owner authorization
- Review authorization
- Strong password validation
- Password confirmation
- Real-time password strength indicator
- Forgot Password flow
- Reset Password flow
- Cryptographically generated reset tokens
- Hashed reset tokens stored in database
- Token expiration
- Single-use password reset tokens
- Secure password hashing with Passport Local Mongoose

> **Note:** The password-reset email delivery system is implemented using Nodemailer, but live SMTP configuration is currently deferred. The application requires an SMTP/email provider configuration to send real reset emails.

---

### ⭐ Reviews & Ratings

- Add reviews to listings
- Rating system
- Delete authorized reviews
- Review author authorization
- Listing owner authorization
- Review validation

---

### 📅 Booking & Reservation System

- Check-in and check-out dates
- Guest selection
- Server-side price calculation
- Service fee calculation
- Booking confirmation
- Double-booking prevention
- Overlapping date validation
- Adjacent reservations supported
- Owner self-booking restriction
- My Trips page
- Booking details page
- Booking cancellation
- Cancelled bookings release dates
- User-specific booking authorization

### 💰 Booking Price Calculation

The booking price is calculated securely on the server:

```text
Number of Nights
        ×
Price Per Night
        =
Subtotal

Subtotal
   +
Service Fee
   =
Total Price
