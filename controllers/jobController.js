const https = require('https');

exports.getJobs = (req, res) => {
    const options = {
        method: 'POST',
        hostname: 'jobs-search-api.p.rapidapi.com',
        port: null,
        path: '/getjobs',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Store your API key in .env
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
            const jobs = JSON.parse(data).jobs || []; // Assuming jobs are under 'jobs' key
            res.render('jobs', { user: req.user, jobs }); // Pass jobs to the view
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
// Function to handle job application submission
exports.applyForJob = async (req, res) => {
    const { jobId, jobExperience, willingToRelocate, currentCTC, startDate } = req.body;
    const user = req.user; // Assuming req.user contains logged-in user info

    try {
        // Send email to user upon successful application with additional application details
        await mailService.sendJobApplicationEmail({
            email: user.email,
            name: user.name,
            jobId,
            jobExperience,
            willingToRelocate,
            currentCTC,
            startDate
        });

        res.status(200).json({ message: 'Application submitted successfully, and email sent.' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};
