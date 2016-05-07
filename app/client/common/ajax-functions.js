// I guess we want these vars to be global???

// This returns the root URL of the current browser window (i.e. http://localhost:8080/).
var appUrl = window.location.origin;

// Create an object with methods (these were extracted from the clickController.client.js file)
var ajaxFunctions = {
  // This function will set up the specified function to run when the page loads,
  // or run it NOW if page has already loaded.
  ready: function ready (fn) {
    // Make sure the arg is a function:
    if (typeof fn !== 'function') {
     return;
    }
  
    // If the page is loaded, run the specified function and return its results:
    if (document.readyState === 'complete') {
     return fn();
    }
  
    // If page is not yet loaded, add an event listenter 
    // (type of event, listener callback func, useCapture (default=false, should all events of the specified type be executed w/ the listener arg))
    // that will run the specified function when it IS LOADED.
    document.addEventListener('DOMContentLoaded', fn, false);
  },
  
  // Retrieve the current nbr of clicks from the API
  // method = the HTTP Method for the request: GET/POST/DELETE
  // url = the url to make the HTTP request to
  // callback = the function to run after getting the response
  ajaxRequest: function ajaxRequest (method, url, callback) {
    // console.log('ajax-functions.js: ajaxRequest', method, url);
    // Create an instance of the XMLHttpRequest object using constructor notation (so we can call its methods):
    var xmlhttp = new XMLHttpRequest();
  
    // Assign a callback to run whenever the readyState property of the XMLHttpRequest obj changes.
    // The readyState changes multiple times during the data retrieval process.
    xmlhttp.onreadystatechange = function () {
      // A readyState of 4 means that the operation (i.e. data retrieval) has been completed.
      // Status of 200 means the request was OK (no errors).
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        // console.log('ajax-functions.js: onreadystatechange', xmlhttp.readyState, xmlhttp.status);
        // console.log(xmlhttp.response);
        // Run the specified callback, passing it the response we got from server (the data from the AJAX request).
        callback(xmlhttp.response);
      }
    };
  
    // Initiate an HTTP request of the specified type
    // 3rd arg = async (make the request asynchronously)
    xmlhttp.open(method, url, true);
    // Execute the open request made above 
    // (this will cause the readyState to change and invoke the callback above)
    xmlhttp.send();
  }
};