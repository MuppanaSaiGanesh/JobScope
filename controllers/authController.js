// controllers/authController.js
const User = require('../models/User'); // Ensure this is correctly importing your User model
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Registration
exports.register = (req, res) => {
    res.render('register', { user: req.user }); // Pass req.user for navbar display
};

exports.registerUser = (req, res) => {
    const { username, password, email, skills, location } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Error hashing password');
        }

        // Create a new user object
        const newUser = { username, password: hash, email, skills, location };
        User.create(newUser, (err) => {
            if (err) {
                console.error('Error creating user:', err);
                return res.status(500).send('Error creating user');
            }
            res.redirect('/auth/login'); // Redirect to login after successful registration
        });
    });
};

// Login
exports.login = (req, res) => {
    res.render('login', { user: req.user }); // Pass req.user for navbar display
};

exports.loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err); // Handle any authentication errors
        if (!user) {
            // Handle the case where user was not found or credentials are invalid
            return res.status(401).send('Invalid credentials'); 
        }
        req.logIn(user, (err) => {
            if (err) return next(err); // Handle login error
            return res.redirect('/jobs'); // Redirect to job listings after successful login
        });
    })(req, res, next);
};

// Logout
exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Handle logout error
        }
        res.redirect('/auth/login'); // Redirect to login page after logout
    });
};
