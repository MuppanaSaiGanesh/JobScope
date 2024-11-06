// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/auth');

// Fetch job listings (requires authentication)
router.get('/', authMiddleware.isAuthenticated, jobController.getJobs);

// Apply for a job (requires authentication)
router.post('/apply', authMiddleware.isAuthenticated, jobController.applyForJob);

// Track job view (requires authentication)
router.post('/view', authMiddleware.isAuthenticated, jobController.trackJobView);

// Dashboard route to show statistics (requires authentication)
router.get('/dashboard', authMiddleware.isAuthenticated, jobController.getDashboardStats);

module.exports = router;
