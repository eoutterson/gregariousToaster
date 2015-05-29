'use strict';

angular.module('snippit', ['snippit.main',
  'snippit.services',
  'snippit.three',
  'snippit.auth',
  'ui.router'
  ])
  .run(['$rootScope', '$location', '$http', function($rootScope, $location, $http) {
    $rootScope.$on('$stateChangeStart', function(e, toState, fromState) {
      $http.get('/auth/isAuthenticated').success(function(resp) {
        if (!resp['auth']) {
          $location.path('/signin');
        }
      });
    });
  }])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        templateUrl: 'templates/main.html',
        controller: 'MainController',
        authenticate: true
      })
      .state('app.three', {
        url: '/three',
        views: {
          'nest': {
            templateUrl: 'templates/three.html',
            controller: 'ThreeController'
          }
        }
      })
      .state('signin', {
        url: '/signin',
        templateUrl: 'templates/signin.html',
        controller: 'AuthController',
      });
    $urlRouterProvider.otherwise('/app/three');
  }]);


'use strict';

angular.module('snippit.auth', ['snippit'])
  .controller('AuthController', ['$scope', '$window', 'ThreeFactory', function($scope, $window, ThreeFactory) {

    var scene, renderer, camera;

    $scope.objects = [];
    $scope.targets = {sphere: []};

    var init = function(){
      camera = new THREE.PerspectiveCamera(30, $window.innerWidth / $window.innerHeight, 1, 10000);
      camera.position.z = 3000;
      scene = new THREE.Scene();

      var vector = new THREE.Vector3();

      var len = data.length

      for (var i = 0; i < len; i++) {
        ThreeFactory.createScene(i, data, scene, $scope.objects);
        ThreeFactory.sphere(i, vector, $scope.targets.sphere, 800, len);
      };

      renderer = new THREE.CSS3DRenderer();
      renderer.setSize($window.innerWidth, $window.innerHeight);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.classList.add('render');

      $scope.transform($scope.targets.sphere, 2000);

      document.getElementById('signin').appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize, false);
    };

    $scope.transform = function(targets, duration) {

      TWEEN.removeAll();

      for (var i = 0; i < $scope.objects.length; i++) {
        var object = $scope.objects[i];
        var target = targets[i];

        new TWEEN.Tween(object.position)
          .to({x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        new TWEEN.Tween(object.rotation)
          .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }


      new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate($scope.render)
        .start();
    };


    var onWindowResize = function() {

      camera.aspect = window.innerWidth / $window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, $window.innerHeight);

      $scope.render();
    };


    var animate = function() {
      requestAnimationFrame(animate);
      TWEEN.update();
    };

    angular.element(document).ready(function () {
      init();
      animate();
    });

    $scope.render = function(){
      // var timer = Date.now() * 0.0002;
      // camera.position.x = Math.cos( timer ) * 3000;
      // camera.position.z = Math.sin( timer ) * 3000;
      // camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };

  }]);

'use strict';

angular.module('snippit.main', ['snippit', 'snippit.services'])
  .controller('MainController', ['Facebook', '$scope', function(Facebook, $scope) {

    $scope.pictures = null;

    $scope.getWallData = function() {
      Facebook.getWallData().then(function(resp) {
        console.log(resp);
      });
    }

    $scope.getAlbumData = function() {
      console.log('ALBUMS', $scope.pictures.albums);
    }

  }]);

'use strict';

angular.module('snippit.services', ['snippit'])
  .factory('ThreeFactory', function() {


    var createScene = function(i, collection, scene, objects, click){
      var el = document.createElement('div');
      el.className = 'element';

      var image = document.createElement('img');
      image.src = collection[i].source;
      el.appendChild(image);

      var object = new THREE.CSS3DObject(el);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);

      if(click){
        var bound = click.bind(i);
        el.addEventListener('click', bound);
      }

      objects.push(object);
    };

    var table = function(n, i, target){
      var object = new THREE.Object3D();
      object.position.x = ((i % n) * 140) - 280;
      object.position.y = -((Math.floor(i / n) + 1) * 180) + 540;
      target.push(object);
    };


    var sphere = function(i, vector, target, r, len){
      var phi = Math.acos(-1 + (2 * i) / len);
      var theta = Math.sqrt(len * Math.PI) * phi;

      var object = new THREE.Object3D();

      object.position.x = r * Math.cos(theta) * Math.sin(phi);
      object.position.y = r * Math.sin(theta) * Math.sin(phi);
      object.position.z = r * Math.cos(phi);

      vector.copy(object.position).multiplyScalar(2);

      object.lookAt(vector);

      target.push(object);
    };


    var helix = function(n, i, vector, target, spacing, offset, xRad, zRad, step){
      var object = new THREE.Object3D();
      var phi = i * spacing + (i % n)/n * (Math.PI * 2);

      object.position.x = xRad * Math.sin(phi);
      object.position.y = -(i * step) + offset;
      object.position.z = zRad * Math.cos(phi);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);
      target.push(object);
    };

    var grid = function(n, i, target){
      var object = new THREE.Object3D();

      object.position.x = ((i % n) * 400) - 800;
      object.position.y = (-(Math.floor(i / n) % n) * 400) + 800;
      object.position.z = (Math.floor(i / (n * n))) * 1000 - 2000;

      target.push(object);
    };

    return {
      createScene: createScene,
      table: table,
      sphere: sphere,
      helix: helix,
      grid: grid
    };
  })
  .factory('Facebook', ['$http', function($http) {

    var getWallData = function() {
      return $http.get('/getFacebookWall');
    };

    var getAlbumData = function() {
      return $http.get('/getFacebookAlbums');
    }

    return {
      getWallData: getWallData,
      getAlbumData: getAlbumData
    };
  }])
;

'use strict';

angular.module('snippit.three', ['snippit'])
  .controller('ThreeController', ['$scope', 'ThreeFactory', '$window', '$document', function($scope, ThreeFactory, $window, $document) {
    
    var scene, renderer, camera, controls;

    var viewHeight = function(){
      return $window.innerHeight - (document.getElementsByClassName('header')[0].offsetHeight);
    }

    $scope.objects = [];
    $scope.targets = {table: [], sphere: [], helix: [], doubleHelix: [], tripleHelix: [], grid: []};

    var init = function(){
      camera = new THREE.PerspectiveCamera(30, $window.innerWidth / viewHeight(), 1, 10000);
      camera.position.z = 800;
      scene = new THREE.Scene();

      var vector = new THREE.Vector3();

      var len = data.length

      for (var i = 0; i < len; i++) {
        ThreeFactory.createScene(i, data, scene, $scope.objects, $scope.log);
        ThreeFactory.table(5, i, $scope.targets.table);
        ThreeFactory.sphere(i, vector, $scope.targets.sphere, 800, len);
        ThreeFactory.helix(1, i, vector, $scope.targets.helix, 0.175, 450, 900, 900, 8);
        ThreeFactory.helix(2, i, vector, $scope.targets.doubleHelix, 0.175, 450, 500, 500, 50);
        ThreeFactory.helix(3, i, vector, $scope.targets.tripleHelix, 0.1, 450, 500, 500, 50);
        ThreeFactory.grid(5, i, $scope.targets.grid);
      };

      renderer = new THREE.CSS3DRenderer();
      renderer.setSize($window.innerWidth, viewHeight());
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.classList.add('render');

      $scope.transform($scope.targets.table, 2000);

      document.getElementById('container').appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize, false);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.damping = 0.2;
      controls.addEventListener('change', $scope.render);
    };

    $scope.log = function(){
      console.log(this);
    }

    $scope.clicked = function(targets){
      $scope.transform(targets, 2000);

      new TWEEN.Tween(camera.position)
        .to({x: 0, y: 0, z: 3000}, 2000)
        .start();

      new TWEEN.Tween(camera.rotation)
        .to({_x: -0, _y: 0, _z: -0}, 2000)
        .start();

      new TWEEN.Tween(controls.center)
        .to({x: 0, y: 0, z: 0}, 2000)
        .start();
    }

    $scope.transform = function(targets, duration) {

      TWEEN.removeAll();

      for (var i = 0; i < $scope.objects.length; i++) {
        var object = $scope.objects[i];
        var target = targets[i];

        new TWEEN.Tween(object.position)
          .to({x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        new TWEEN.Tween(object.rotation)
          .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }


      new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate($scope.render)
        .start();
    };

    var onWindowResize = function() {

      camera.aspect = window.innerWidth / viewHeight();
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, viewHeight());

      $scope.render();
    };

    var animate = function() {
      requestAnimationFrame(animate);
      TWEEN.update();
      controls.update();
    };

    angular.element(document).ready(function () {
      init();
      animate();
    });

    $scope.render = function(){
      renderer.render(scene, camera);
    };
  }]);

