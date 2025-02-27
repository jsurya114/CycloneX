const dotenv = require("dotenv")
dotenv.config();
const express = require('express');
const session = require('express-session');
const passport = require('passport'); // Import Passport
const path = require('path');
const cookieParser =require('cookie-parser')
const app = express();
const PORT = process.env.PORT || 3000;
const adminRouter = require("./Apps/routes/admin/adminRoute");
const userRouter = require('./Apps/routes/user/userRoute');
const productRouter = require('./Apps/routes/admin/productRoutes')
const connectDB = require("./Apps/config/db");
const MongoStore = require("connect-mongo");


// Connect Database
connectDB();

// Middleware for parsing JSON and form data
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb', extended: true }));
app.use(cookieParser())


// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store:MongoStore.create({
        mongoUrl:process.env.MONGO_URI,
        ttl:24*60*60
    }),
    cookie: {
        secure: process.env.NODE_ENV==='production',
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

//404
app.use((req,res)=>{
    res.render('404')
})

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Error:", error.stack);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(500).render("500", {
      message: "File too large. Please upload smaller files.",
    });
  }

  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    return res.status(500).render("500", { message: "Internal Server Error" });
  }

  res.status(500).render("500", { message: "Internal Server Error" });
});



// Start the server
app.listen(PORT, () => {
    console.log(`CycloneX running on http://127.0.0.1:${PORT}`);
});