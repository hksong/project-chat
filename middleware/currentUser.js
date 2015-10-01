var currentUser = function(req, res, next) {
  if (req.session.id === null) {
    res.locals.currentUser = null;
    next();
  }
  else {
    User.findById(req.session.id, function(err, user) {
      if (err) {
        next(err);
      }
      else {
        res.locals.currentUser = user;
        next();
      }
    });
  }
};

module.exports = currentUser;