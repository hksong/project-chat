var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var mongoose = require("mongoose");

var roomSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
  privateRoom: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

roomSchema.pre('save', function(next) {
  var room = this;
  if (room.privateRoom) {
    if (!room.password) {
      return next(new Error("private rooms require passwords"));
    }
    else if (!room.isModified('password')) {
      return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(room.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }

        room.password = hash;

        next();
      });
    });
  }
  else if (room.password !== undefined) {
    return next(new Error("public rooms cannot have passwords"));
  }
  else {
    next();
  }
});

var Room = mongoose.model("Room", roomSchema);

module.exports = Room;