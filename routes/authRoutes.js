// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Register routes
router.get('/register', authController.register);
router.post('/register', authController.registerUser);

// Login routes
router.get('/login', authController.login);
router.post('/login', authController.loginUser);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;
