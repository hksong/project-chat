var loginHelper = function (req, res, next) {
  req.login = function (user) {
    req.session.id = user._id;
    req.session.username = user.username;
  };

  req.logout = function () {
    req.session.id = req.session.username = null;
  };

  if (req.session.id === undefined)
    req.session.id = req.session.username = null;
  
  next();
};

module.exports = loginHelper;
