'use strict';

// Import and store our mongoose.model within the Clicks var, 
// so we can update the clickHandler methods to query this collection. 
// Mongoose will automatically find the correct collection in the db 
// (it looks for the plural vers of the model name we provide in the mongoose.model(...) function). 
// Also, MongoDB will create the collection if it does not already exist.
var Clicks = require('../models/clicks.js');

var Users = require('../models/users.js');

// This function no longer needs to be passed the db object as an arg
// cuz we will use the model object above.
function ClickHandler () {
  // Define a method to retrieve the current number of clicks from the db:
  // This takes a request obj and a response obj.
  this.getClicks = function (req, res) {
    var totalResult = {};
    
    // Query the db (there should only be 1 document):
    // The Mongoose is different from the MongoDB driver in that it does not execute the query immediately. 
    // Mongoose will execute the function only when the .exec method is called.
    Clicks
      .findOne({}, { '_id': false })
      .exec(function (err, result) {
        console.log('ClickHandler.getClicks Clicks.findOne:');
        if (err) {
          throw err;
        }
      
        if (result) {
          console.log(result);
          // Send a response to the browser via JSON:
          //res.json(result);
          totalResult.clicksRes = result;
        } else {
          // No docs in collection.
          // Create a new document using the Clicks model.
          // Then insert it into the db via save().
          var newDoc = new Clicks({ 'clicks': 0 });
          newDoc.save(function (err, doc) {
            if (err) {
              throw err;
            }
            // res.json(doc);
            totalResult.clicksRes = doc;
          });
        }
        
        // Also update the nbr of clicks for this particular User.
        // Find the user by their GitHub ID (these IDs are numeric and unique to each account).
        // The properties and values of the request object are populated by Passport once the authentication has completed.
        Users
          .findOne({ 'github.id': req.user.github.id }, { '_id': false })
          .exec(function (err, result) {
            console.log('ClickHandler.getClicks Users.findOne:');
            if (err) { throw err; }
            
            console.log(result);
            // We know this has to return a doc cuz it would already have been added by 
            // authentication callback code in passport.js if this is a new user.
            // res.json(result.nbrClicks);
            totalResult.usersRes = result.nbrClicks;
            res.json(totalResult);
          });
      });
  };
  
  // Increment the clicks count in the db:
  this.addClick = function (req, res) {
    // TS: CHANGED
    var totalResult = {};
    // Return the first document found (matching on all docs), 
    // then increment the clicks field by 1:
    Clicks
      .findOneAndUpdate({}, { $inc: { 'clicks': 1 } })
      .exec(function (err, result) {
        console.log('ClickHandler.addClick Clicks.findOneAndUpdate:');
        if (err) { throw err; }

        console.log(result);
        // send the results to the browser in JSON format:
        // res.json(result);
        totalResult.clicksRes = result;
        
        // Also update the nbr of clicks for this particular user:
        Users
          .findOneAndUpdate({ 'github.id': req.user.github.id }, { $inc: { 'nbrClicks.clicks': 1 } })
          .exec(function (err, result) {
            console.log('ClickHandler.addClick Users.findOneAndUpdate:');
            if (err) { throw err; }
            console.log(result);
            // res.json(result.nbrClicks);
            totalResult.usersRes = result.nbrClicks;
            res.json(totalResult);
          });
      });
  };
  
  // Reset the clicks count to 0 in the db:
  this.resetClicks = function (req, res) {
    // TS CHANGED:
    var totalResult = {};
    
    // Reset the nbr of clicks for just this user
    Users
      .findOneAndUpdate({ 'github.id': req.user.github.id }, { 'nbrClicks.clicks': 0 })
      .exec(function (err, result) {
        if (err) { throw err; }
        // res.json(result.nbrClicks);
        totalResult.usersRes = result.nbrClicks;
        
        // TS: CHANGED -- This has to happen AFTER the above:
        // Subtract this user's clicks from the total nbr.
        Clicks
          .findOneAndUpdate({}, { $inc: { 'clicks': -(totalResult.usersRes.clicks) }})
          .exec(function (err, result) {
            if (err) { throw err; }
    
            // send the results to the browser in JSON format:
            totalResult.clicksRes = result;
            res.json(totalResult);
          });
      });
      
    // Return the first document found (matching on all docs), 
    // then set its clicks field to zero:
    // Clicks
    //   .findOneAndUpdate({}, { 'clicks': 0 })
    //   .exec(function (err, result) {
    //     if (err) { throw err; }

    //     // send the results to the browser in JSON format:
    //     res.json(result);
    //   });
  };
}

// We changed this to initial caps???
module.exports = ClickHandler;