const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Assuming db is your MySQL connection

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

module.exports = router;
