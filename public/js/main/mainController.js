'use strict';

angular.module('snippit.main', ['snippit', 'snippit.services'])
  .controller('MainController', ['$rootScope', '$scope', 'Facebook', 'Snips', '$state', function($rootScope, $scope, Facebook, Snips, $state) {

    $rootScope.bool.info = false;

    $rootScope.facebookUser = {};

    $rootScope.loading = false;

    $rootScope.newSnip = true;

    $scope.tab = 1;

    $rootScope.snips = {};

    $scope.albumNames = [];

    $rootScope.snipPhotos = {};

    $scope.showTab = function(n) {
      $scope.tab = n;
    };

    $scope.fetchUser = function() {
      Facebook.getFacebookUser().success(function(resp) {
        $rootScope.facebookUser = resp;
        $scope.instaAuth = !!resp.hasToken;
        Snips.getSnips(resp.snips).success(function(resp) {
          $rootScope.snips = JSON.parse(resp);
        });
      });
    };

    $scope.albumClick = function(name, id) {
      $rootScope.loading = true;
      $rootScope.albumPhotos = {};
      if(!id){
        Facebook.refreshWallData().success(function(resp){
          var pics = JSON.parse(resp).wallPhotos;
          for (var i = 0; i < pics.picture.length;i++){
            $rootScope.loading = false;
            $rootScope.albumPhotos[pics.id[i]] = {src: pics.picture[i], thumb: pics.thumbnail[i]}
          }
        });
      } else {
        Facebook.getAlbumPhotos(name, id).success(function(resp) {
          var parse = JSON.parse(resp);
            for(var key in parse) {
              $rootScope.loading = false;
              $rootScope.albumPhotos = parse[key];
            }
        });
      }
      if($state.current.name !== 'app.profile') {
        $rootScope.newSnip = true;
        $rootScope.snipPhotos = {};
        $state.go('^.profile');
      }
    };

     $scope.getInstagram = function(){
      $rootScope.loading = true;
      $rootScope.albumPhotos = {};
      Facebook.getInstagram().success(function(resp) {
        $rootScope.albumPhotos = JSON.parse(resp);
        $rootScope.loading = false;
      }).error(function(data){
        console.log('Please re-authorize your Instagram', data);
        $rootScope.instaAuth = false;
      });
      if($state.current.name !== 'app.profile') {
        $rootScope.newSnip = true;
        $rootScope.snipPhotos = {};
        $state.go('^.profile');
      }
    }

    $scope.view2D = function(key, value) {
      $rootScope.snipId = key;
      $rootScope.snipPhotos = value.img;
      $rootScope.newSnip = false;
      $rootScope.snipName = value.name;
      $rootScope.snipOpen = true;
      if($state.current.name !== 'app.profile') {
        $state.go('^.profile');
      }
    };

    $scope.view3D = function(key, value) {
      $rootScope.snipPhotos = value.img;
      $rootScope.snipId = key;
      $rootScope.newSnip = true;
      $scope.snipName = value.name;
      $rootScope.snipOpen = false;
      if($state.current.name !== 'app.three') {
        $state.go('^.three');
      } else {
        $rootScope.rerender();
      }
    };

    $scope.deleteSnip = function(key) {
      delete $rootScope.snips[key];
      Snips.deleteSnip(key);
    };


    $scope.init = function() {

      Facebook.getAlbumData().success(function(resp) {
        var parse = JSON.parse(resp);
        $scope.albumNames.push({name:'Facebook Wall Photos'});
        for (var key in parse) {
          $scope.albumNames.push(parse[key]);
        }
      });
      $scope.fetchUser();
    }();

  }]);
