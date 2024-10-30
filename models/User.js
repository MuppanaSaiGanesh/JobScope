const db = require('../config/db');

const user = {
    create: (userData, callback) => {
        const { username, password, email, skills, location } = userData;
        const sql = 'INSERT INTO users (username, password, email, skills, location) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [username, password, email, skills, location], (err, results) => {
            callback(err, results);
        });
    },
    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], (err, results) => {
            callback(err, results[0]); // Return the first result
        });
    },
    findById: (id, callback) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.query(sql, [id], (err, results) => {
            callback(err, results[0]); // Return the first result
        });
    }
};

module.exports = user;
