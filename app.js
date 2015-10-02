// boilerplate code
require("dotenv").load();
var express = require('express'),
  engine = require('ejs-mate'),
  bodyParser = require("body-parser");
  methodOverride = require('method-override'),
  session = require('cookie-session'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  currentUser = require('./middleware/currentUser.js'),
  currentRoom = require('./middleware/currentRoom.js'),
  loginHelper = require('./middleware/loginHelper.js'),
  routeHelper = require('./middleware/routeHelper.js'),
  sessionAlerts = require('./middleware/sessionAlerts.js'),
  ensureLoggedIn = routeHelper.ensureLoggedIn,
  ensureCorrectUser = routeHelper.ensureCorrectUser,
  preventLoginSignup = routeHelper.preventLoginSignup,
  db = require("./models"),
  User = db.User,
  Room = db.Room,
  app = express(),

  jwt_secret = process.env.JWT_SECRET;

app.engine('ejs', engine);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true})); 
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: "something you should ignore",
}));
app.use(loginHelper);
app.use(currentUser);
app.use(currentRoom);
app.use(sessionAlerts);

var defaultRoomID;

// initialize Admin user, Default room, and Default Room ID
User.findOne({username: "admin"}, function(err, user) {
  if (err) {
    throw err;
  }
  else if (user === null) {
    var newAdmin = new User({username: "admin", password: process.env.ADMIN_SECRET});
    newAdmin.save(function(err) {
      Room.findOne({name: "default"}, function(err, room) {
        if (err) {
          throw err;
        }
        else if (room === null) {
          var newDefault = new Room({name: "default", owner: newAdmin.id});
          newDefault.save(function(err) {
            defaultRoomID = newDefault.id;
            newAdmin.currentRoom = defaultRoomID;
            newAdmin.ownedRooms.push(defaultRoomID);
            newAdmin.save();
          });
        }
      });
    });
  }
  else {
    defaultRoomID = user.ownedRooms[0].toString();
  }
});

// 'GET' for root '/'
app.get('/', function(req, res) {
  res.redirect('/rooms');
});

// INDEX Room
app.get('/rooms', ensureLoggedIn, function(req, res) {
  Room.findById(defaultRoomID, function(err, rooms) {
    if (err) {
      throw err;
    }
    res.locals.htmlTitle = "Room";
    res.locals.activeNav = "rooms";
    res.locals.rooms = rooms;
    res.render('rooms/index');
  });
});

// SHOW User
app.get('/users/:id', ensureLoggedIn, function(req, res) {
  var param = req.params.id;
  var mongoID = new mongoose.Types.ObjectId((param.length === 24 ? param : "000000000000"));
  User.findOne({$or: [{username: param}, {_id: mongoID}]}, function(err, user) {
    if (err) {
      throw err;
    }
    else if (user === null) {
      res.redirect('/rooms');
    }
    else {
      res.locals.user = user;
      res.locals.htmlTitle = user.username;
      res.locals.activeNav = "showUser";
      res.render("users/show");
    }
  });
});

// EDIT User
app.get('/users/:id/edit', ensureLoggedIn, ensureCorrectUser, function(req, res) {
  res.locals.user = res.locals.currentUser;
  res.locals.htmlTitle = "change";
  res.locals.activeNav = "showUser";
  res.render("users/edit");
});

// UPDATE User Password
app.put('/users/:id', function(req, res) {
  User.authenticate(req.body.user, function(err, user) {
    if (err) {
      req.session.alerts = "Current password does not match";
      res.redirect('/users/'+req.params.id+'/edit');
    }
    else {
      user.password = req.body.user.newPassword;
      user.save();
      req.logout();
      res.redirect('/login');
    }
  });
});

// DELETE User
app.delete('/users/:id', function(req, res) {
  User.authenticate(req.body.user, function(err, user) {
    if (err) {
      req.session.alerts = "Password does not match";
      res.redirect('/users/'+req.params.id+'/');
    }
    else {
      user.remove();
      req.logout();
      res.redirect('/login');
    }
  });
})

// SIGNUP GET
app.get('/signup', preventLoginSignup, function(req, res) {
  res.locals.htmlTitle = "Sign Up";
  res.locals.activeNav = "newUser";
  res.render('signup');
});

// SIGNUP POST
app.post('/signup', function(req, res) {
  User.create(req.body.user, function(err, user) {
    if (err) {
      if (err.code === 11000) {
        req.session.alerts = "username already exists";
        res.redirect('/signup');
      }
      else {
        throw err;
      }
    }
    else {
      user.currentRoom = defaultRoomID;
      user.save();
      req.login(user);
      res.redirect('/login');
    }
  });
});

// LOGIN GET
app.get('/login', preventLoginSignup, function(req, res) {
  res.locals.htmlTitle = "Login";
  res.locals.activeNav = "login";
  res.render('login');
});

// LOGIN POST
app.post('/login', preventLoginSignup, function(req, res) {
  User.authenticate(req.body.user, function(err, user) {
    if (err) {
      req.session.alerts = err.message;
      res.redirect('/login');
    }
    else {
      req.login(user);
      res.redirect('/rooms');
    }
  });
});

// LOGOUT
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/rooms');
});

// CATCH ALL
app.get('*', function(req, res){
  res.render('site/404', {htmlTitle: "OOPS!", activeNav: null});
});

// start server
app.listen(process.env.PORT || 3000, function() {
});
