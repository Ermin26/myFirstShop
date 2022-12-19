module.exports.isLoged = (req, res, next) => {
    if (!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be logged in to make changes.");
        res.redirect('/login');
    } else {

        next();
    }
}
