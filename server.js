'use strict';

// Express.js
var express = require('express');
// Our code for handling routes:
var routes = require('./app/routes/index.js');
// For communicating with the db:
//var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

// Initialize Express
var app = express();

// Load the .env file, parse the contents, and assign it to process.env
// Include path to place invisible to others on public Cloud9 workspace.
// https://www.npmjs.com/package/dotenv
// require('dotenv').config({path: '~/private/.env'});
require('dotenv').config({path: '/home/ubuntu/private/.env'});
console.log(process.env.GITHUB_KEY);
console.log(process.env.GITHUB_SECRET);
console.log(process.env.MONGO_URI);
console.log(process.env.APP_URL);

// Run the code in the Passport config file (/app/config/passport.js), 
// passing the exported function inside that the passport obj created above.
// This essentially initializes the Passport functionality. ????????????????
require('./app/config/passport')(passport);

// Try to connect to the Mongo db named 'clementinejs' on port 27017.
// If this db doesn't exist, Mongo will create it.
// Port 27017 is the default port that MongoDB uses.
// Use the connect string that was stored in the .env file and then parsed out to process.env:
mongoose.connect(process.env.MONGO_URI);

// Tell server how to find static files in this routes:
// TS: CHANGED THIS to be under /client dir (moved server code elsewhere, so not accessible to user here)
app.use('/controllers', express.static(process.cwd() + '/app/client/controllers'));
// TS: CHANGED THIS to be under /client dir
app.use('/common', express.static(process.cwd() + '/app/client/common'));
// This seems to be OK to be static.
app.use('/public', express.static(process.cwd() + '/public'));

// Use Express's app.use function to configure the session options.
// 'secret' is our session secret, which is essentially a "password" used to create the session and prevent it from being hijacked. 
// 'resave' tells whether to re-save the session to storage even when it hasn't been modified (typically set to false).
// 'saveUninitialized' tells whether to store a new session which hasn't been modified (default is true).
app.use(session({
  secret: 'secretClementine',
  resave: false,
  saveUninitialized: true
}));

// This is required to initialize the Passport app and instantiate its functionality.
app.use(passport.initialize());
// This middleware enables the usage of session storage.
app.use(passport.session());

// Pass the Express and Passport objects into the routes modules so it can access their funcitionality.
routes(app, passport);

// Use the port from the .env file (otherwise 8080)
var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log('Listening on port ' + port + '...');
});

