// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Assuming db is your MySQL connection
const jobController = require('../controllers/jobController'); // Import jobController

// Admin authorization middleware
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/auth/login'); // Redirect non-admins to login
}

// Admin dashboard route
router.get('/dashboard', isAdmin, (req, res) => {
    // Query the database to get all users
    const query = 'SELECT * FROM users'; // Adjust based on your table name
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }
        res.render('adminDashboard', { users: results });
    });
});

// User-specific dashboard route
router.get('/user/:id', isAdmin, (req, res) => {
    const userId = req.params.id; // Get the user ID from the URL
    
    // Fetch user data
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], async (err, userResults) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }

        // Fetch stats for the user using getDashboardStats function
        try {
            const stats = await jobController.getDashboardStats(userId);  // Handle async properly

            // Render the user's dashboard
            res.render('dashboard', { user: userResults[0], stats });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).send('Error fetching user stats');
        }
    });
});

module.exports = router;
