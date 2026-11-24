const express = require("express");
const path = require('path');
const app = express();
app.use(express.json());

let boards = require('./routes/boardRoutes');
app.use(boards);

app.use(express.static('public'));
module.exports = app;
