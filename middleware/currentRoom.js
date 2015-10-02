var currentRoom = function(req, res, next) {
  if (res.locals.currentUser === null) {
    res.locals.currentRoom = null;
    next();
  }
  else {
    Room.findOne({name: res.locals.currentUser.currentRoom}, function(err, room) {
      if (err) {
        next(err);
      }
      else {
        res.locals.currentRoom = room;
        next();
      }
    });
  }
};

module.exports = currentRoom;