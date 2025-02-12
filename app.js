const dotenv = require("dotenv")
dotenv.config();
const express = require('express');
const session = require('express-session');
const passport = require('passport'); // Import Passport
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const adminRouter = require("./Apps/routes/adminRoute");
const userRouter = require('./Apps/routes/userRoute');
const connectDB = require("./Apps/config/db");

// Connect Database
connectDB();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files
app.use(express.static('public'));

// Configure express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set view engine and views directory
app.set('views', [
    path.join(__dirname, 'Apps', 'views', 'admin'),
    path.join(__dirname, 'Apps', 'views', 'user')
]);
app.set('view engine', 'ejs');

// Basic route
app.use("/", userRouter);
app.use("/admin", adminRouter);
// Start the server
app.listen(PORT, () => {
    console.log(`CycloneX on http://127.0.0.1:${PORT}`);
});