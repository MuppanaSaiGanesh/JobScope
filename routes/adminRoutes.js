const express = require('express');
const router = express.Router();

// Define routes for admin functionalities
router.get('/dashboard', (req, res) => {
    res.render('adminDashboard');
});

module.exports = router;
