var db = require("../models");

var routeHelper = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureCorrectUser: function(req, res, next) {
    if (req.params.id !== req.session.id) {
      res.redirect('/rooms');
    }
    else {
     return next();
    }
  },

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null) {
      res.redirect('/rooms');
    }
    else {
     return next();
    }
  }
};

module.exports = routeHelper;
