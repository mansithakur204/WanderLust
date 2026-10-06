WanderLust 🏡
An Airbnb-inspired full-stack vacation rental platform built with Node.js, Express, MongoDB, EJS, Cloudinary and Mapbox.

Live Demo: https://wanderlust-01a2.onrender.com/listings
GitHub: https://github.com/mansithakur204/WanderLust
✨ Overview
WanderLust is a full-stack vacation rental web application inspired by modern property-booking platforms. It supports listing discovery, search and filtering, user authentication, favorites, property galleries, reviews, maps, and a database-backed booking system.
The project started as a learning project and has been extended into a portfolio-ready full-stack application with authentication, authorization, cloud image storage, geolocation, wishlist functionality, and reservation logic.
🚀 Features
🏠 Listings
- Create, edit and delete property listings
- Property categories
- Search by destination/title/location
- Category filtering
- Price sorting
- Multiple property images
- Responsive property gallery and lightbox
- Property type, guests, bedrooms, beds and bathrooms
- Amenities
- Cloudinary image storage
🔎 Discovery
- Destination search
- Category navigation
- Price sorting
- Responsive listing cards
- Mapbox location/map integration
❤️ Wishlist & Favorites
- Save listings to a personal wishlist
- AJAX-based favorite/unfavorite interaction
- Wishlist page
- Duplicate-safe saved listings
- Automatic cleanup when a listing is deleted
- Authentication-protected wishlist actions
🔐 Authentication & Security
- User registration
- Login/logout with Passport
- Session-based authentication
- Protected routes
- Owner/review authorization
- Strong password policy
- Password confirmation
- Password strength indicator
- Forgot-password/reset-password token flow
- Cryptographically generated, hashed, time-limited reset tokens
Note: Live password-reset email delivery requires SMTP/email-provider credentials to be configured. SMTP setup is intentionally deferred in the current deployment.

⭐ Reviews
- Add reviews and ratings
- Delete authorized reviews
- Listing-owner/review-author authorization
- Rating validation
📅 Booking & Reservations
- Check-in/check-out dates
- Guest selection
- Server-side price calculation
- Service fee calculation
- Double-booking prevention
- Adjacent reservations are supported
- Booking confirmation
- My Trips
- Booking details
- Booking cancellation
- Cancelled bookings release the dates
- Users cannot book their own listings
📱 Responsive UI
- Mobile-friendly layouts
- Tablet and desktop layouts
- Responsive navigation
- Responsive listing galleries
- Responsive booking card
- Accessible form states and interactive controls
🛠️ Tech Stack
Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- EJS
- Font Awesome
Backend
- Node.js
- Express.js
- Mongoose
- Passport.js
- passport-local-mongoose
- express-session
- connect-mongo
- connect-flash
- Joi
Services
- MongoDB Atlas
- Cloudinary
- Mapbox
- Nodemailer (password-reset email architecture)
Deployment
- Render
📁 Project Structure
WanderLust/
├── controllers/
├── models/
├── routes/
├── views/
│   ├── bookings/
│   ├── layouts/
│   ├── listings/
│   ├── users/
│   └── includes/
├── public/
│   ├── css/
│   └── js/
├── utils/
├── init/
├── app.js
├── schema.js
├── package.json
└── .gitignore
⚙️ Local Setup
1. Clone the repository
git clone https://github.com/mansithakur204/WanderLust.git
cd WanderLust
2. Install dependencies
npm install
3. Create .env
Create a .env file in the project root.
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
MAP_TOKEN=your_mapbox_token

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
Optional SMTP configuration for real password-reset emails:
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
EMAIL_FROM="WanderLust Support" <your_sender_email>
Never commit .env or secret credentials to GitHub.
4. Start the application
npm start
If the project uses the development script:
npm run dev
Then open the local URL shown by the server.
🔒 Security Notes
- Secrets are stored in environment variables.
- .env is excluded from Git.
- Passwords are handled through passport-local-mongoose.
- New passwords require uppercase, lowercase, number, special character and minimum length rules.
- Password reset tokens are hashed before storage.
- Password reset tokens expire and are single-use.
- Booking prices are calculated on the server.
- Booking ownership is verified server-side.
- Wishlist and booking actions require authentication.
🧪 Verification
The project includes focused test scripts for:
node utils/test_passwords.js
node utils/test_password_reset.js
node utils/test_bookings.js
Server-side syntax can be checked with:
node -c app.js
📌 Current Status
Completed
- Responsive UI
- Listing CRUD
- Search/filter/sorting
- Multi-image gallery
- Wishlist/favorites
- Authentication
- Strong password validation
- Password reset flow
- Reviews
- Mapbox integration
- Cloudinary integration
- Booking/reservation engine
- My Trips
- Booking cancellation
- Double-booking prevention
- Render deployment
Deferred
- Live SMTP/email-provider configuration
- Real payment gateway
- Host dashboard
- Guest dashboard
- Advanced calendar synchronization
- Host payouts
- Coupons and payment processing
🌐 Deployment
The application is deployed on Render.
Live: https://wanderlust-01a2.onrender.com/listings
Environment-specific secrets should be configured in the deployment platform rather than committed to the repository.
🎯 Portfolio Highlights
This project demonstrates practical experience with:
- REST-style Express routing
- MVC architecture
- MongoDB/Mongoose data modeling
- Authentication and authorization
- Secure password handling
- Cloud image uploads
- Geolocation APIs
- AJAX/fetch interactions
- Reservation conflict detection
- Server-side business logic
- Responsive UI development
- Deployment and environment configuration
👩‍💻 Author
Mansi Singh
Built as a full-stack development learning and portfolio project.
