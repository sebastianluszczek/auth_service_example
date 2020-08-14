const express = require('express');
const cors = require('cors')

// App
const app = express();

// JSON parse middleware
app.use(express.json());

app.use(cors());

app.use('/auth', require('./routes/auth'));

module.exports = app;