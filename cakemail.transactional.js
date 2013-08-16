/*
    cakemail.transactional
    http://www.cakemail.com/

    Copyright (c)2013, Cakemail Inc.
    Author Cedric Dugas
    Licensed under MIT

    Usage: cakemail.transactional.send(options).success(function(data, xhr){ })
*/
if(!window.cakemail) var cakemail = {};
(function () {
    cakemail.transactional= {};
    // configs are extended with the options passed in send()
    // you can pass as much options as you want in the config so your code stay at a minimum
    cakemail.transactional.configs = {
        publickey : ""
    };

    /* available options
        {
          "template": "name_in_app",
          "language": "en_US",
          "sender_email": "test@test.com",
          "sender_name": "Firstname Lastname",
          "subject": "A message from my company!",
          "recipients": [
            "willem@cakemail.com"
          ],
          // in the template thisvariable would be {{ firstname }}
          // we use twig as templating engine
          "merge_variables": {
            "firstname": "Willem"
          }
        }
    */

    // Method you use
     cakemail.transactional.send = function(settings){
        // this url never change
        var url = "https://transactional.cakemail.com/send",
            promise = new cakemail.transactional.Promise(),
            options = {};


        // extend our little options
        deepExtend(options,  cakemail.transactional.configs);
        deepExtend(options, settings || {});

        // formatting data to be sent
        var publickey = options.publickey;
        delete options.publickey;

        var postdata = JSON.stringnify({
          publickey : publickey,
          data: options
        });

        // start xhr request
        if(XMLHttpRequest)
        {
          var request = new XMLHttpRequest();
          if("withCredentials" in request)
          {
            // Firefox 3.5 and Safari 4
            // 
            request.open('POST', url, true);
            request.setRequestHeader("publickey",publickey);
            request.setRequestHeader('Content-Type', 'text/plain');
            request.send(postdata);

            request.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    promise.success(results , e);
                }
            };
            request.onerror = function (e) {
                promise.error(e);
            };
          }
          else if (XDomainRequest)
          {
           // IE8
           var xdr = new XDomainRequest();
           xdr.open("POST", url);
           xdr.send(postdata);

            xdr.onload = function(e) {
                results = JSON.parse(this.responseText);
                promise.success(results, e);
            };
            xdr.onerror = function(e) {
               promise.error(e);
            };
          }
        }
        return promise;
    };


    // small utility for extending objects
    function deepExtend (destination, source) {
      for (var property in source) {
        if (source[property] && source[property].constructor &&
         source[property].constructor === Object) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
        } else {
          destination[property] = source[property];
        }
      }
      return destination;
    }

    // need to init promise
    cakemail.transactional.Promise =  function() {};
    cakemail.transactional.Promise.prototype.success = function (results) {
        this.success = arguments[0]; //reassign
        if(typeof this.success == "function")  this.success(results, e);
    };
    cakemail.transactional.Promise.prototype.error = function (error) {
      /* move from unfulfilled to rejected */
        this.error = arguments[0]; //reassign
        if(typeof this.error == "function") this.error(error);
    };
})();