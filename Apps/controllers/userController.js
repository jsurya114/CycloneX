const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const userController = {

    logins:async (req,res) => {
        res.render('logins',{
             logoPath: '/frontend/imgs/logos/cyclonelogo.png'
        })
    },
    loginspost:async (req,res) => {
        console.log(req.body)
       const {email,password}=req.body
       try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("User does not exist");
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid credentials");
        }

        // If login successful, redirect or send a success response
        res.render("home");

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal Server Error");
    }

    },
    signup:async (req,res) => {
        res.render('signup',{
            logoPath: '/frontend/imgs/logos/cyclonelogo.png'
       })
    },
    createuser: async (req, res) => {
        try {
            console.log('Request Body:', req.body); // Log the request body
            const { fullname, email, phone, password, confirm_password } = req.body;
    
            if (password !== confirm_password) {
                return res.status(400).send('Passwords do not match');
            }
    
            const userExist = await User.findOne({ email });
            if (userExist) {
                return res.status(400).send('User already exists');
            }
    
            const salt = await bcrypt.genSalt(5);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            const newUser = new User({
                fullName: fullname,
                email: email,
                mobile: phone,
                password: hashedPassword,
            });
    
            await newUser.save();
            res.redirect('/');
        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    home:async (req,res) => {
        res.render('home',{
            logoPath: '/frontend/imgs/logos/cyclonelogo.png'
       })
    }


}

module.exports = userController