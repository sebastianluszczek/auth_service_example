const config = require("../config/config.js");

const mongoose = require("mongoose");
// mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = config.url;
db.credentials = require("./credential.model.js")(mongoose);
db.tokens = require("./token.model.js")(mongoose);

module.exports = db;
