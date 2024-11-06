// middleware/auth.js
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (err, user) => {
            if (err) return next(err);
            req.user = user; // Attach user data to request object
            next();
        });
    } else {
        req.user = null; // If not authenticated, set req.user to null
        next();
    }
};

// Ensure route is accessible only to authenticated users
authMiddleware.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login'); // Redirect unauthenticated users to login
};

module.exports = authMiddleware;
