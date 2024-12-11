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

            // Log job data for debugging purposes
            console.log('Fetched jobs:', jobs);

            // Store jobs in the database
            jobs.forEach((job) => {
                const apiJobId = job.id ? String(job.id) : null; // Ensure apiJobId is a string

                // If API Job ID is not valid, skip inserting this job
                if (!apiJobId) {
                    console.error('Invalid Job ID:', job);
                    return;
                }

                const title = job.title || 'Unknown Title'; // Default value for missing title
                const location = job.location || 'Unknown Location';
                const company = job.company || 'Unknown Company';
                const description = job.description || 'No description available';
                const url = job.url || '#';

                // Check if job already exists in the database
                const sqlCheck = 'SELECT id FROM jobs WHERE api_job_id = ?';
                db.query(sqlCheck, [apiJobId], (err, results) => {
                    if (err) {
                        console.error('Error checking job existence:', err);
                        return;
                    }

                    if (results.length === 0) {
                        const sqlInsert = `
                            INSERT INTO jobs (api_job_id, title, location, company, description, url)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;
                        db.query(sqlInsert, [
                            apiJobId,
                            title,
                            location,
                            company,
                            description,
                            url
                        ], (err) => {
                            if (err) {
                                console.error('Error inserting job into the database:', err);
                            }
                        });
                    }
                });
            });

            res.render('jobs', { user: req.user, jobs });
        });
    });

    request.on('error', (error) => {
        console.error('Failed to fetch job listings:', error);
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

exports.applyForJob = (req, res) => {
    const { jobId: apiJobId, jobExperience, willingToRelocate, currentCTC, startDate } = req.body;
    const user = req.user;

    // Validate the incoming data
    if (!apiJobId) {
        return res.status(400).json({ error: "Invalid Job ID." });
    }

    // Query to retrieve the job by API job ID
    db.query('SELECT id FROM jobs WHERE api_job_id = ?', [apiJobId], (err, results) => {
        if (err) {
            console.error('Error retrieving job:', err);
            return res.status(500).json({ error: 'Failed to retrieve job information' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const jobId = results[0].id;

        const sql = `
            INSERT INTO job_applications (user_id, job_id, job_experience, willing_to_relocate, current_ctc, start_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [user.id, jobId, jobExperience, willingToRelocate, currentCTC, startDate],
            (err) => {
                if (err) {
                    console.error('Error saving job application:', err);
                    return res.status(500).json({ error: 'Failed to submit application' });
                }
                res.status(200).json({ message: 'Application submitted successfully.' });
            }
        );
    });
};

exports.trackJobView = (req, res) => {
    const apiJobId = req.body.jobId;
    const user = req.user;

    if (!apiJobId) {
        return res.status(400).json({ error: 'Invalid Job ID.' });
    }

    db.query('SELECT id FROM jobs WHERE api_job_id = ?', [apiJobId], (err, results) => {
        if (err) {
            console.error('Error retrieving job:', err);
            return res.status(500).json({ error: 'Failed to retrieve job information' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const jobId = results[0].id;

        const sql = 'INSERT INTO job_views (user_id, job_id) VALUES (?, ?)';
        db.query(sql, [user.id, jobId], (err) => {
            if (err) {
                console.error('Error saving job view:', err);
                return res.status(500).json({ error: 'Failed to track job view' });
            }
            res.status(200).json({ message: 'Job view recorded successfully.' });
        });
    });
};

exports.getDashboardStats = (userId) => {
    return new Promise((resolve, reject) => {
        const sqlTotalJobs = 'SELECT COUNT(*) AS totalJobs FROM jobs';
        const sqlJobViews = 'SELECT COUNT(*) AS totalViews FROM job_views WHERE user_id = ?';
        const sqlJobApplications = 'SELECT COUNT(*) AS totalApplications FROM job_applications WHERE user_id = ?';

        db.query(sqlTotalJobs, (err, totalJobsResult) => {
            if (err) return reject('Failed to fetch total jobs');
            
            db.query(sqlJobViews, [userId], (err, viewsResult) => {
                if (err) return reject('Failed to fetch job views');

                db.query(sqlJobApplications, [userId], (err, applicationsResult) => {
                    if (err) return reject('Failed to fetch job applications');

                    const stats = {
                        totalJobs: totalJobsResult[0].totalJobs,
                        totalViews: viewsResult[0].totalViews,
                        totalApplications: applicationsResult[0].totalApplications,
                    };

                    resolve(stats);
                });
            });
        });
    });
};
