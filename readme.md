# Cakemail transactional tool plugin

This plugin is an ajax wrapper around the CakeMail transactional api. It use CORS and support Chrome, FF & ie8 and up.

## installation

<p>Insert the javascript file into your html document</p>

	<script src="cakemail.transactional.js"></script>

## Configs

Configs can be put globally or passed throught the send(options) method. When passed to the send method the global configs are extended with the passed options.

Config example:


	<script src="cakemail.transactional.js"></script>
	<script>
		cakeRelay.configs = {
			// CakeMail public key
			publickey : "mypublickey",
          	// you can have multiple languages for a given template
          	"language": "en_US",
          	"sender_email": "dev@cakemail.com",
          	"sender_name": "Firstname Lastname"
        }
	</script>
	

### Public Key
A public key is required to use the api. It is given in the Javascript API tab in the online tool on http://transactional.cakemail.com/login

## Usage
To send an email you simply use the send(options) method. As said in the Configs section options passed to send extend cakemail.transactional.configs.

Example :

	cakemail.transactional.send({
		"template": "name_in_app",
		"subject": "A message from my company!",
  	    // recipients for the email
      	"recipients": [
        	"v@cakemail.com"
      	],
     	// in the template thisvariable would be {{ firstname }}
      	// we use twig as templating engine
        "merge_variables": {
        	"firstname": "Willem"
        }
	});


## Callbacks
This plugin use promises for handling callbacks. you must call then() and then then choose the appropriate function.

### onResolve

	cakemail.transactional.send({
		"template": "name_in_app", 
		"recipients": [
        	"v@cakemail.com"
      	]
	}).then(function onResolve(data, xhr){
		// do stuff
	});

### onReject
On ie8 & ie9 we use XDomainRequest which does not support error returns, but we added a default one.

	cakemail.transactional.send({
		"template": "name_in_app", 
		"recipients": [
        	"v@cakemail.com"
      	]
	}).then(function onResolve(data, xhr){
		console.log(data)
		console.log(xhr)
	},
	function onReject(xhr){
		// do stuff
	});
