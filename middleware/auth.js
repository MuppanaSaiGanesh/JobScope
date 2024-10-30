const User = require('../models/User');

const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, (err, user) => {
            if (err) return next(err);
            req.user = user; // Attach user to request
            next();
        });
    } else {
        req.user = null; // Set user to null if not authenticated
        next();
    }
};

// Middleware to restrict access to authenticated users only
authMiddleware.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login'); // Redirect non-authenticated users to login
};

module.exports = authMiddleware;
