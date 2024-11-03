// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/auth'); // Ensure only authenticated users access this

// Fetch job listings
router.get('/', authMiddleware.isAuthenticated, jobController.getJobs); 

// Apply for a job
router.post('/apply', authMiddleware.isAuthenticated, jobController.applyForJob);

module.exports = router;
