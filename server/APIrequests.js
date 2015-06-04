var configAuth = require('./config/auth.js');
var https = require('https');
var request = require('request');

exports.facebookGET = function(accessToken, apiPath, callback, ampersand) {
  ampersand = ampersand ? '&' : '?';
  // creating options object for the https request
  var options = {
      // the facebook open graph domain
      host: 'graph.facebook.com',

      // secured port, for https
      port: 443,

      // apiPath is the open graph api path
      path: apiPath + ampersand+'limit=100&access_token=' + accessToken,

      // well.. you know...
      method: 'GET'
  };
  // console.log("options.path>>>>>",options.path);
// https://graph.facebook.com/v2.3/10100131608434454?fields=photos&access_token=CAAUPcYHaZBoMBAH1yfMInwTeM43I1ZBEnWQP9DOztYb1jNjRNCQDRagnt5BnNH6CzWqJlJ7t36a2tOCW9obZBxvxKaZBlP83WQ5694x95SOGVYwsqrmCzEHEh3yGytzoFZAaSGfjH1kp6iNZBHzSNPXuekYjROxCLQfYEGZAGTZBvilEVD0XFwdq4pRh9RyeFNteXoRb9ggZC0GWObuM1MKAC
// https://graph.facebook.com/v2.3/854583941784?/photos?access_token=CAAUPcYHaZBoMBAFvpTrB6KbIXfEWYZAz6qdZCFRaxVN7X9GlXGZCb9ZCUUu5PxmNxZARSUuJ9M1qUpMD0gboibrUAhwSvkZANK3wdIjDf4Ee48cFIv0fhrCsmzGkVRZAtMnEWMW0MMZCIZBr9s6dDghou6LQybUfhC8G4O8EOPiZBQLZBYnmHrzibhBzptfU2KhrYEQH9rdnPXjqKMIrBZCxzoGvd
  // create a buffer to hold the data received
  // from facebook
  var buffer = '';

  // initialize the get request
  var request = https.get(options, function(result){
      result.setEncoding('utf8');

      // each data event of the request receiving
      // chunk, this is where i`m collecting the chunks
      // and put them together into one buffer...
      result.on('data', function(chunk){
          buffer += chunk;
      });

      // all the data received, calling the callback
      // function with the data as a parameter
      result.on('end', function(){
          callback(buffer);
      });
  });

  // just in case of an error, prompting a message
  request.on('error', function(e){
      console.log('error from facebook.get(): '
                   + e.message);
  });

  request.end();
}


//redirects to the initial instagram Auth. This will be returned to the callback
// and provide a code that can be traded for a token
exports.authInstagram = function(req, res) {
  res.redirect('https://api.instagram.com/oauth/authorize/?client_id='+configAuth.instagramAuth.clientID+'&redirect_uri='+configAuth.instagramAuth.callbackURL+'&response_type=code');
}


//Once instagram sends the code to the callback, this funciton handles the POST request 
// that trades the code for the token and user information
exports.instagramToken = function(req, res, code, cb){
  request.post(
    { form: { client_id: configAuth.instagramAuth.clientID,
              client_secret: configAuth.instagramAuth.clientSecret,
              grant_type: 'authorization_code',
              redirect_uri: configAuth.instagramAuth.callbackURL,
              code: code
            },
      url: 'https://api.instagram.com/oauth/access_token'
    },
    function (err, response, body) {
      if (err) {
        console.log("error in Post", err)
      }else{

        cb(JSON.parse(body))
      }
    }
  );

}
// https://api.instagram.com/oauth/access_token?client_id=1f515809bd3e4107afea13c77ced3274&client_secret=c7eeefda5e4b44a78fde61b95c77b4d9&grant_type=authorization_code&redirect_uri=&code=e6b08ff1783e46f1b51bae9068f7cb91
// curl -vF 'client_id=1f515809bd3e4107afea13c77ced3274' \
//     -F 'client_secret=c7eeefda5e4b44a78fde61b95c77b4d9' \
//     -F 'grant_type=authorization_code' \
//     -F 'redirect_uri=Ahttp://127.0.0.1:3000/auth/instagram/callback' \
//     -F 'code=77cc2d1ea0bd498d83a2df21cf15ddc0' \
//     https://api.instagram.com/oauth/access_token
