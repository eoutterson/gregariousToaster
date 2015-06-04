'use strict';

//==passport and Oauth
var FacebookStrategy = require('passport-facebook');
var configAuth = require('./auth.js');
var client = require('./mongo');

module.exports = function(passport) {
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. 
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    client.then(function(db){
      return db.collection('users').findOneAsync({id: id})
        .then(function(user){
          if(!user) {
            console.log("user not found in desiralize")
          }
          done(null, user);
          
        });
    })
  });
   // User.findById(id, function(err, user){
   //    done(err, user);
//==============

//=============
// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
  passport.use(new FacebookStrategy({
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {

      client.then(function(db) {
        return db.collection('users').findOneAsync({ id: profile.id })
        .then(function(user) {
          if (!user) {
            console.log('user NOT found, creating a new one...');
            var newUser = {
              id: profile.id,
              name: profile.displayName,
              FBtoken: accessToken
            };
            db.collection('users').insert(newUser);
            return done(null, newUser);
          }
          else {
            console.log('user is found, re-setting accessToken...');
            db.collection('users').update(
              {_id: user._id},
              {$set:
                {FBtoken : accessToken}
              }
            );
            return done(null, user);
          }
        });
      });

  }));
};

