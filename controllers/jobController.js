// controllers/jobController.js
const https = require('https');
const db = require('../config/db');

exports.getJobs = (req, res) => {
    const options = {
        method: 'POST',
        hostname: 'jobs-search-api.p.rapidapi.com',
        port: null,
        path: '/getjobs',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'jobs-search-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    };

    const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const jobs = JSON.parse(data).jobs || [];

            // Store jobs in the database
            jobs.forEach((job) => {
                const apiJobId = job.id; // Adjust according to your API's job ID field
                const sqlCheck = 'SELECT * FROM jobs WHERE api_job_id = ?';

                // Check if the job already exists in the database
                db.query(sqlCheck, [apiJobId], (err, results) => {
                    if (err) {
                        console.error('Error checking job existence:', err);
                        return;
                    }

                    // If job doesn't exist, insert it into the database
                    if (results.length === 0) {
                        const sqlInsert = `
                            INSERT INTO jobs (api_job_id, title, location, company, description, url)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;

                        db.query(sqlInsert, [
                            apiJobId,
                            job.title,
                            job.location,
                            job.company,
                            job.description,
                            job.url
                        ], (err, result) => {
                            if (err) {
                                console.error('Error inserting job into the database:', err);
                            }
                        });
                    }
                });
            });

            // Render jobs after processing the API response
            res.render('jobs', { user: req.user, jobs });
        });
    });

    request.on('error', (error) => {
        console.error(error);
        res.status(500).send('Failed to fetch job listings');
    });

    request.write(JSON.stringify({
        search_term: 'web',
        location: 'mumbai',
        results_wanted: 50,
        site_name: ['indeed', 'linkedin', 'zip_recruiter', 'glassdoor'],
        distance: 50,
        job_type: 'fulltime',
        is_remote: false,
        linkedin_fetch_description: false,
        hours_old: 72
    }));

    request.end();
};

// Function to handle job application submission
exports.applyForJob = (req, res) => {
    const { jobId: apiJobId, jobExperience, willingToRelocate, currentCTC, startDate } = req.body;
    const user = req.user;

    // Debugging statements
    console.log('API Job ID:', apiJobId);
    console.log('Job Experience:', jobExperience);
    console.log('Willing to Relocate:', willingToRelocate);
    console.log('Current CTC:', currentCTC);
    console.log('Start Date:', startDate);
    console.log('User ID:', user ? user.id : 'User not found');

    // Validate jobId
    if (!apiJobId) {
        console.error("Job ID is missing or invalid.");
        return res.status(400).json({ error: "Invalid Job ID." });
    }

    // Step 1: Fetch the job's integer ID using the apiJobId
    db.query('SELECT id FROM jobs WHERE api_job_id = ?', [apiJobId], (err, results) => {
        if (err) {
            console.error('Error retrieving job:', err);
            return res.status(500).json({ error: 'Failed to retrieve job information' });
        }

        if (results.length === 0) {
            console.error('Job not found with the given API Job ID:', apiJobId);
            return res.status(404).json({ error: 'Job not found' });
        }

        const jobId = results[0].id; // Use the integer ID from the jobs table

        // Step 2: Insert the application using the integer jobId
        const sql = `
            INSERT INTO job_applications (user_id, job_id, job_experience, willing_to_relocate, current_ctc, start_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [user.id, jobId, jobExperience, willingToRelocate, currentCTC, startDate],
            (err, result) => {
                if (err) {
                    console.error('Error saving job application:', err);
                    return res.status(500).json({ error: 'Failed to submit application' });
                }
                res.status(200).json({ message: 'Application submitted successfully.' });
            }
        );
    });
};
