var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/project_chat");

mongoose.set("debug", true);

module.exports.User = require("./user");
module.exports.Room = require("./room");
