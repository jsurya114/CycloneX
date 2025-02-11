const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy=require('passport-facebook')
const User = require('../models/userModel')
 
passport.use