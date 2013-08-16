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
        var url = location.protocol+"//transactional.cakemail.com/send",
            promise = new Promise(),
            options = {};


        // extend our little options
        deepExtend(options,  cakemail.transactional.configs);
        deepExtend(options, settings || {});

        // formatting data to be sent
        var publickey = options.publickey;
        delete options.publickey;

        var postdata = JSON.stringify({
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
            request.setRequestHeader('Content-Type', 'text/plain');
            request.send(postdata);

            request.onload = function (e) {
                if (this.status === 200) {
                    results = JSON.parse(this.responseText);
                    promise.resolve(results , this);
                }else{
                  promise.reject(this);
                }
            };
            request.onerror = function (e) {
               promise.reject(this);
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
                promise.resolve(results, this);
            };
            xdr.onerror = function(e) {
              var data = {
                responseText : "ie8 & ie9 does not support CORS error",
                status : "400"
              };
              promise.reject(data);
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
    function Promise() {
        this._thens = [];
    }

    Promise.prototype = {
   
    /* This is the "front end" API. */
   
    // then(onResolve, onReject): Code waiting for this promise uses the
    // then() method to be notified when the promise is complete. There
    // are two completion callbacks: onReject and onResolve. A more
    // robust promise implementation will also have an onProgress handler.
    then: function (onResolve, onReject) {
      // capture calls to then()
      this._thens.push({ resolve: onResolve, reject: onReject });
    },
   
    // Some promise implementations also have a cancel() front end API that
    // calls all of the onReject() callbacks (aka a "cancelable promise").
    // cancel: function (reason) {},
   
    /* This is the "back end" API. */
   
    // resolve(resolvedValue): The resolve() method is called when a promise
    // is resolved (duh). The resolved value (if any) is passed by the resolver
    // to this method. All waiting onResolve callbacks are called
    // and any future ones are, too, each being passed the resolved value.
    resolve: function (val, xhr) { this._complete('resolve', val, xhr); },
   
    // reject(exception): The reject() method is called when a promise cannot
    // be resolved. Typically, you'd pass an exception as the single parameter,
    // but any other argument, including none at all, is acceptable.
    // All waiting and all future onReject callbacks are called when reject()
    // is called and are passed the exception parameter.
    reject: function (ex) { this._complete('reject', ex); },
   
    // Some promises may have a progress handler. The back end API to signal a
    // progress "event" has a single parameter. The contents of this parameter
    // could be just about anything and is specific to your implementation.
    // progress: function (data) {},
   
    /* "Private" methods. */
   
    _complete: function (which, arg, arg2) {
      // switch over to sync then()
      this.then = which === 'resolve' ?
        function (resolve, reject) { resolve && resolve(arg); } :
        function (resolve, reject) { reject && reject(arg); };
      // disallow multiple calls to resolve or reject
      this.resolve = this.reject = function () { throw new Error('Promise already completed.'); };
      // complete all waiting (async) then()s
      var aThen, i = 0;

      while (aThen = this._thens[i++]) { aThen[which] && aThen[which](arg, arg2); }
      delete this._thens;
    }
    
  };
})();