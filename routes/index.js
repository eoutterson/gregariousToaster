'use strict';

var express = require('express');
var utils = require('../server/utils.js');
var api = require('../server/APIrequests.js');

// module.exports = router;




module.exports = function(passport) {

  var router = express.Router();

  // router.get('/',ensureAuthenticated, function(req, res){
  //   console.log("authenticated")
  //   res.redirect('/');

  // });

/// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope:
      ['user_photos', 'user_friends']
    }), function(req, res){
  // The request will be redirected to Facebook for authentication, so this
  // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/#/signin' }),
    function(req, res) {
      res.redirect('/#/app/three');
  });


  //Get /auth/instagram
  // sends user to authenticate our app at instagram, it returns a code that is NOT a token (a token post request must be made
  // to instagram to exchange the code for a token)
  router.get('/auth/instagram', function(req, res){
    //handles url redirect
    api.authInstagram(req, res)
  });

  //Instagram sends a callback with a validation code in the URL
  router.get('/auth/instagram/callback', function(req, res){
    console.log(req.url, "URL IS HERE")
    console.log(req.originalUrl, "ORIGINAL URL IS HERE")
    var code = req.url.split('code=')[1]
    console.log(code, "THIS IS THE CODE")
  });

  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  router.get('/auth/isAuthenticated', function(req, res){
    var authorized = {};
    authorized['auth'] = req.isAuthenticated();
    res.json(authorized);
  });

  router.get('/getData', function(req, res){
    utils.grabData(req, res, function(user){
      res.json(user);
    });
  });

  router.get('/getFacebookWall', function(req, res){
    console.log(res.json, "gefacebookwall router");
    api.facebookGET(req.user.FBtoken, '/v2.3/'+req.user.id+'/photos', function(data) {
      utils.FBWallPhotos(req, res, data, function(user){
        res.json(user);
      });
    }, false);
  });

  router.get('/getFacebookAlbums', function(req, res){
    api.facebookGET(req.user.FBtoken, '/v2.3/'+req.user.id+'/albums', function(data) {
      utils.handleAlbums(req, res, data, function(albums){
        console.log("albums sent in index", albums);
        res.json(albums);
      });
    }, false);
  });

  router.post('/getFacebookAlbumPhotos', function(req, res){
    var album = {id: req.body.id, name: req.body.name};
    api.facebookGET(req.user.FBtoken,'/v2.3/' + album.id + '/photos', function(data){
      utils.getAlbumPhotos(req, res, album, data, function(user){
        console.log(JSON.parse(user));
        res.json(user);
      });
    }, false);
  });




    return router;
};


// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     console.log(req.isAuthenticated(), "AM I TRUE OR FALSE")
//     return next();
//   }
//   console.log("NOT AUTHENTICATED")
//   res.redirect('/#/signin')
// }
