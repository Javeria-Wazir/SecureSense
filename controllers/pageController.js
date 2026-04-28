exports.renderHome = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('home', { username: req.session.username });
};

exports.renderAbout = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('about', { username: req.session.username });
};

exports.renderContact = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('contact', { username: req.session.username });
};
