'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create a new Mongoose schema.
// Each Mongoose schema corresponds to a MongoDB collection. 
// Each key in the schema defines and casts its corresponding property in the MongoDB document.
var Click = new Schema(
  // Defininw the clicks property and cast its value as a Number type:
  { clicks: Number },
  // Mongoose automatically adds a property to every schema called __v, which is used for versioning.
  // Disable this:
  { versionKey: false }
);

// Convert our schema to a Mongoose model. 
// The model is an object constructor that represents documents within the database.
// 1st arg = the SINGULAR name of the collection in the db.
//           Ours is named 'Click' which corresponds to our 'clicks' collection in the db. 
//           Mongoose will automatically search for the PLURAL version of this arg in the db.
// 2nd arg = The name of the schema to be converted to the model.
//           We defined this schema above.
// This model is exported with module.exports, which is a Node function that exports the function or object for use within another file using the require function. This is a common Node pattern.
module.exports = mongoose.model('Click', Click);