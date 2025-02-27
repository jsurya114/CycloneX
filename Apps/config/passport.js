const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Use environment variable if set, otherwise fallback
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://127.0.0.1:3000/auth/google/callback',
    scope: ["profile", "email"]
},
async (accessToken, refreshToken, profile, done) => {
    try {
       
        
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                fullName: profile.displayName,
                isVerified: true
            });
            await user.save();
        }
        // Create a JWT token if needed for your application.
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Return an object containing only the user and token.
        return done(null, { user, token });
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize only the user's _id to the session.
passport.serializeUser((userWithToken, done) => {
    done(null, userWithToken.user._id);
});

// Deserialize the user by using the stored _id.
// Added a defensive check in case stale session data exists.
passport.deserializeUser(async (id, done) => {
    try {
        // If the id is an object with a user property (from an old session), extract the _id.
        if (typeof id === 'object' && id.user) {
            id = id.user._id;
        }
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
