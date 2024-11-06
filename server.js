const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db'); // Database connection
const passportConfig = require('./passportConfig')(passport);
const authMiddleware = require('./middleware/auth'); // Import the authentication middleware

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Ensure req.user is set if authenticated
app.use(authMiddleware);

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes); // Mounts job-related routes
app.use('/admin', adminRoutes); // Admin routes

// Render the login page for the root route
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
