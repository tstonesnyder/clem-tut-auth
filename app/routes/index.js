'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

// Pass the Express.js 'app' obj from server.js so we can use it's methods here.
// Also pass the passport obj from server.js so we can use Passport's methods here.
module.exports = function (app, passport) {
  // Determine if the user is logged in.
  // This function is Express middleware (Express itself is simply a series of middleware calls 
  // (i.e. the routing in Express is considered middleware).
  // This function takes a 3rd arg 'next', 
  // which is a common convention used to tell Express to pass control to the next handler (or middleware) in the process.
  function isLoggedIn (req, res, next) {
    // This is a Passport method that returns true if the user has been authenticated:
    if (req.isAuthenticated()) {
      // User is authenticated, so pass control to the next handler (middleware):
      return next();
    } else {
      // User is NOT authenticated yet, so send them to the login page: 
      res.redirect('/login');
    }
  }
  
  function isNotLoggedIn (req, res, next) {
    if (!req.isAuthenticated()) {
      // User is authenticated, so pass control to the next handler (middleware):
      return next();
    } else {
      // User IS already logged in, so take them to the main page instead of the login page: 
      res.redirect('/');
    }
  }
  
  // Instantiate the ClickHandler function object
  // When using Mongoose (instead of the MongoDB driver), it no longer needs to be passed the db as an object
  // cuz the db info is inherent in using a Mongoose schema. 
  // The model we created in app/modles/clicks.js gets exported for use within our controllers. 
  var clickHandler = new ClickHandler();
  
  // Use Express's route() function (alternative to Node's app.get).
  app.route('/')
    // Call isLoggedIn to check if user has been authenticated.
    // If NOT, that function will redirect to the /login route. 
    // If YES, that function calls next() which tells Express to pass control back 
    // to the app.route middleware and proceed with processing the route.
    // (so I guess it will come back here).
    .get(isLoggedIn, function (req, res) {
        res.sendFile(path + '/public/index.html');
    });

  // This route does NOT require user to be authenticated.
  // It just shows the page with the LOGIN btn.
  // Currently it allows you to go here even if you ARE already logged in.
  // Change this so it takes you to root page if you are logged in?
  // TS: CHANGED -- if already logged in, it will take them to main route.
  app.route('/login')
    .get(isNotLoggedIn, function (req, res) {
      res.sendFile(path + '/public/login.html');
    });

  // This route will be used when a user clicks on a LOGOUT btn to log out of the app.
  // Call Passport's req.logout() function, which will remove the req.user property
  // and clear out any sessions that are present.
  // Once logged out, the user will be redirected back to the /login page.
  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/login');
    });

  app.route('/profile')
    .get(isLoggedIn, function (req, res) {
      res.sendFile(path + '/public/profile.html');
    });

  // This route is our user API that stores the user's GitHub info for us to retrieve on the front end.
  // The :id at the end of the route is a route parameter.
  // When the /auth/github route is requested and Passport authenticates successfully with GitHub, 
  // Passport creates a user property on the Express req object. 
  // This object contains all of the fields requested from the GitHub API (username, display name, nbr of repos, ID, etc.).
  // When this route is requested, the ID from this user obj is passed as part of the URL (e.g. /api/1234567).
  // This makes these requested URLs unique to each user.
  // When a get request is made to this route, Express should reply with a JSON object 
  // that contains the req.user.github object from Passport. 
  // This object contains all the relevant user info, and we will query this from the front end later for the profile page.
  app.route('/api/:id')
    .get(isLoggedIn, function (req, res) {
      res.json(req.user.github);
    });

  // This route is used when user clicks the "Login" button on the /login.html page.
  // Here we initiate authentication with GitHub 
  // by calling Passport's authenticate() function with the appropriate strategy ('github').
  app.route('/auth/github')
    .get(passport.authenticate('github'));

  // This is the callback URL we gave to GitHub when we set up authentication with them (on GitHub site).
  // This route be called after GitHub authentication has completed. 
  // We pass the Passport authentication and an object that tells Passport where to redirect to
  // for either a successful or failed authentication attempt.
  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));
    
    
  // Run the getClicks function whenever there is an HTTP GET request on this route.
  // Run the addClick func when HTTP POST request on this route, etc.
  // [Note that in order to be called from app.route().get(), this function must have the 2 args req and res.]
  // When you go to this route in browser (a GET) you should see [{"clicks":0}]
  // https://clem-tutorial-beg-tstonesnyder.c9users.io/api/clicks
  app.route('/api/:id/clicks')
    .get(isLoggedIn, clickHandler.getClicks)
    .post(isLoggedIn, clickHandler.addClick)
    .delete(isLoggedIn, clickHandler.resetClicks);
  // app.route('/api/clicks')
  //   .get(clickHandler.getClicks)
  //   .post(clickHandler.addClick)
  //   .delete(clickHandler.resetClicks);
};