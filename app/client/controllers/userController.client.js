'use strict';

// This controller will be used for both the index.html and profile.html views.
// This will retrieve the user info from the API and update the appropriate values in the view. 

// create an IIFE
(function () {
  // appUrl is set in ajax-functions.js
  var apiUrl = appUrl + '/api/:id';
  
  // Store refs to HTML elements
  // This element should exist in BOTH views (index.html and profile.html)
  var displayName = document.querySelector('#display-name');
  // These elements WON'T exist in both views, so set to null if not found.
  var profileId = document.querySelector('#profile-id') || null;
  var profileUsername = document.querySelector('#profile-username') || null;
  var profileRepos = document.querySelector('#profile-repos') || null;

  // Callback for the AJAX functions (make it flexible so it can be reused for several different elements).
  // data = the object containing the user info from the API
  // element = a variable pointing to the HTML element we want to update
  // userProperty = a string representing the property to get on the user object
  function updateHtmlElement (data, element, userProperty) {
    element.innerHTML = data[userProperty];
  }
  
  // Create the AJAX function to query the API and return the user information
  // and pass it to our ready() function so it will run when this page is done loading.
  // SEE NOTES ON clickController.client.js
  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
    // Parse the data we get back from the AJAX request:
    var userObject = JSON.parse(data);

    // Both views that call this need the user name, so always set that on the page.
    updateHtmlElement(userObject, displayName, 'displayName');

    // Only try to set this info on the page, if a spot exists for it on the page.
    // (not on index.html, but it is on profile.html)
    if (profileId !== null) {
     updateHtmlElement(userObject, profileId, 'id');   
    }

    if (profileUsername !== null) {
     updateHtmlElement(userObject, profileUsername, 'username');   
    }

    if (profileRepos !== null) {
     updateHtmlElement(userObject, profileRepos, 'publicRepos');   
    }
  }))
   
})();