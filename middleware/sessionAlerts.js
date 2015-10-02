var sessionAlerts = function(req, res, next) {
  res.locals.alerts = null;
  if (req.session.alerts) {
    res.locals.alerts = req.session.alerts;
    req.session.alerts = null;
  }
  next();
};

module.exports = sessionAlerts;
