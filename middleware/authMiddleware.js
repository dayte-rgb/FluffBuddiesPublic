// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware to check if user is NOT authenticated (for login/signup pages)
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.redirect('/job-search');
  } else {
    next();
  }
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};
