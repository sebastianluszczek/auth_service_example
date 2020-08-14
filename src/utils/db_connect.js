const mongoose = require("mongoose");

const connection = "mongodb://auth_db:27017/auth";

const connectDb = () => {
    return mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true });
};

module.exports = connectDb;