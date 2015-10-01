// boilerplate code
require("dotenv").load();
var express = require('express'),
  engine = require('ejs-mate'),
  bodyParser = require("body-parser");
  methodOverride = require('method-override'),
  session = require('cookie-session'),
  currentUser = require('./middleware/currentUser.js'),
  loginHelper = require('./middleware/loginHelper.js'),
  routeHelper = require('./middleware/routeHelper.js'),
  sessionAlert = require('./middleware/sessionAlert.js'),
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
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: "something you should ignore",
}));
app.use(loginHelper);
app.use(currentUser);
app.use(sessionAlert);

// 'GET' for root '/'
app.get('/', function(req, res) {
  res.redirect('/rooms');
});

// INDEX Room
app.get('/rooms', function(req, res) {
  Room.find({}, function(err, rooms) {
    if (err) throw err;
    res.locals.htmlTitle = "Room";
    res.locals.activeNav = "rooms";
    res.locals.rooms = rooms;
    res.render('rooms/index');
  });
});

// NEW Room
app.get('/rooms/new', function(req, res) {
  res.locals.htmlTitle = "Add New Room";
  res.locals.activeNav = "newRoom";
  res.render("rooms/new");
});

// CREATE Room
app.post('/rooms', function(req, res) {
  Room.create(req.body.room, function(err, room) {
    if (err) {
      throw err;
    }
    else {
      res.redirect('/rooms/'+room._id);
    }
  });
});

// SHOW Room
app.get('/rooms/:id', function(req, res) {
  Room.findById(req.params.id, function(err, room) {
    if (err) throw err;
    if (room) {
      res.locals.htmlTitle = room.REPLACE_WITH_KEY;
      res.locals.activeNav = "showRoom";
      res.locals.room = room;
      res.render("rooms/show");
    }
    else {
      res.redirect('/404');
    }
  });
});

// EDIT Room
app.get('/rooms/:id/edit', ensureLoggedIn, ensureCorrectUser, function(req, res) {
  Room.findById(req.params.id, function(err, room) {
    if (err) throw err;
    if (room) {
      res.locals.room = room;
      res.locals.htmlTitle = "Edit Room";
      res.locals.activeNav = "showRoom";
      res.render("rooms/edit");
    }
    else {
      res.redirect('/404');
    }
  });
});

// UPDATE Room
app.put('/rooms/:id', function(req, res) {
  Room.findById(req.params.id, function(err, room) {
    if (err) {
      throw err;
    }
    else {
      room = req.body.room;
      room.save();
      res.redirect('/rooms/'+room._id);
    }
  });
});

// DESTROY Room
app.delete('/rooms/:id', function(req, res) {
  Room.remove(req.params.id, function(err, room) {
    if (err) {
      throw err;
    }
    else {
      res.redirect('/rooms');
    }
  });
});

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
      user.save();
      req.login(user);
      res.redirect('/rooms');
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
      req.session.alerts = err;
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
  console.log('Server running on port:3000');
});
