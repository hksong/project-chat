var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/project_chat");

mongoose.set("debug", true);

module.exports.User = require("./user");
module.exports.Room = require("./room");
