'use strict';

angular.module('snippit', ['snippit.main',
  'snippit.services',
  'snippit.three',
  'snippit.auth',
  'snippit.search',
  'snippit.profile',
  'autocomplete',
  'ui.router'
  ])

  /* This run block checks whether the user is authenticated or not by making
   * a get request to the '/auth/isAuthenticated' route and upon a successful
   * request, checks the response to see if the user is authenticated and
   * redirects them to the 'signin' state if they're not authenticated. This
   * happens on any state change.
   */

  .run(['$rootScope', '$location', '$http', function($rootScope, $location, $http) {
    $rootScope.$on('$stateChangeStart', function() {
      $http.get('/auth/isAuthenticated').success(function(resp) {
        console.log('checking auth...');
        if (!resp.auth) {
          $location.path('/signin');
        }
      });
    });
  }])

  // Configures the various states for the application.

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        templateUrl: 'templates/main.html',
        controller: 'MainController',
        authenticate: true,
      })
      .state('app.three', {
        url: '/three',
        views: {
          'content': {
            templateUrl: 'templates/three.html',
            controller: 'ThreeController'
          },
          'search': {
            templateUrl: 'templates/search.html',
            controller: 'SearchController'
          }
        }
      })
      .state('app.profile', {
        url: '/profile',
        views: {
          'content': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileController'
          }
        }
      })
      .state('signin', {
        url: '/signin',
        templateUrl: 'templates/signin.html',
        controller: 'AuthController',
      });

    // If a requested state is invalid, it will redirect to the three state

    $urlRouterProvider.otherwise('/app/three');
  }]);

