const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
    passport.use(new LocalStrategy(
        { usernameField: 'email' },
        (email, password, done) => {
            User.findByEmail(email, (err, user) => {
                if (err) return done(err);
                if (!user) return done(null, false, { message: 'No user found' });

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) return done(err);
                    if (isMatch) return done(null, user);
                    return done(null, false, { message: 'Incorrect password' });
                });
            });
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};
