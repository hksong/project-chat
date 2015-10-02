var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
  ownedRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  }],
  friends: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

userSchema.pre('save', function(next) {

  var user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
  
      user.password = hash;
  
      next();
    });
  });
});

userSchema.statics.authenticate = function (formData, callback) {
  this.findOne({
    username: formData.username
  },
  function (err, user) {
    if (user === null){
      callback(new Error("Invalid username or password"),null);
    }
    else {
      user.checkPassword(formData.password, callback);
    }
  });
};

userSchema.methods.checkPassword = function(password, callback) {
  var user = this;
  bcrypt.compare(password, user.password, function (err, isMatch) {
    if (isMatch) {
      callback(null, user);
    } else {
      callback(new Error("Invalid username or password"), null);
    }
  });
};

var User = mongoose.model("User", userSchema);

module.exports = User;