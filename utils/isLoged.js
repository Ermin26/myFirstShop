module.exports.isLoged = (req, res, next) => {
    if (!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be logged in to make changes.");
        res.redirect('/login');
    } else {

        next();
    }
}

module.exports.checkCart = (req, res, next) => {
    if (!req.session.cart) {

        req.session.returnTo = req.originalUrl;
        //req.flash('error', "You must add products to cart and choose payment method.");
        res.redirect('/');
    } else {

        next();
    }
}

