var loginHelper = function (req, res, next) {
  req.login = function (user) {
    req.session.id = user._id;
  };

  req.logout = function () {
    req.session.id = null;
  };

  if (req.session.id === undefined)
    req.session.id = null;
  
  next();
};

module.exports = loginHelper;
