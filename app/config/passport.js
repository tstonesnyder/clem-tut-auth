'use strict';

// import the Passport GitHub strategy object, our user model, and our authorization configuration (i.e. GitHub API keys)
var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

// Create an exported function object that will take passport as an argument, 
// and allow us to use Passport's methods inside our Node module. 
// This will require us to pass in Passport to as an argument when calling this module.
module.exports = function (passport) {
  // Serialization is the process of taking info and transforming it into a state (a series of bytes) 
  // that can be stored in persistant storage and streamed across a network. 
  // This infor can then be deserialized into a copy of the original object.
  // In the case of authentication, we're transforming our user object into a format that can be stored within the session.
  // 
  // NOTE: 'done' is a function native to Passport, which tells Passport to proceed in the authentication process.
  // When done(null, user.id) is called, Passport passes this info to the authenticate function. 
  // The info is stored in the req.session.passport.user user object.
  // When subsequent calls are made, Passport will deserialize this info, 
  // and search our User model for the deserialized ID. 
  // This info is then stored in the req.user object.
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
  
  // Tell Passport what type of strategy to use for authentication, 
  // and define what info we want back from GitHub's API.
  //
  // Instantiate a new GitHub Strategy obj and set the authorization properties of that obj 
  // using the info we got from the .env file using auth.js.
  // Passport will use this info to authorize that our app has the privilege of accessing the GitHub API.
  // Also, implement a "verify callback" for the Strategy obj which will ensure the validity of the credentials
  // and supply Passport with the user info that authenticated.
  // The first 3 args of this callback are objs with info passed back from the GitHub API.
  // Once we receive this info back, it's Passport's job to determine whether this user exists in our app db.
  passport.use(new GitHubStrategy(
    {
      clientID: configAuth.githubAuth.clientID,
      clientSecret: configAuth.githubAuth.clientSecret,
      callbackURL: configAuth.githubAuth.callbackURL
    },
    function (token, refreshToken, profile, done) {
      // This makes Node code asynchronous. 
      // Node will wait until the current "tick" of the event loop completes before executing the specified callback function. 
      // Here, this essentially makes Node wait til the user info comes back from GitHub before processing the results.
      process.nextTick(function () {
        // Search the db for a username where github.id == the profile.id from the args passed back from GitHub. 
        User.findOne({ 'github.id': profile.id }, function (err, user) {
          if (err) {
            // If the query returns an error, pass the err obj to Passport's done function (and return the result).
            return done(err);
          }
  
          if (user) {
            // If the user was FOUND, pass the user obj to Passport's done function (and return the result).
            return done(null, user);
          } else {
            // User is NEW. Create a new document via the User model obj:
            var newUser = new User();
            
            // Set the properties of that document using info returned from GitHub:
            newUser.github.id = profile.id;
            newUser.github.username = profile.username;
            newUser.github.displayName = profile.displayName;
            newUser.github.publicRepos = profile._json.public_repos;
            newUser.nbrClicks.clicks = 0;

            // Insert this doc into the collection on the db:
            newUser.save(function (err) {
              if (err) {
                throw err;
              }

              // If successful, pass the user info back to Passport with the done() function:
              return done(null, newUser);
            });
          }
        });
      });
    }
  ));
};