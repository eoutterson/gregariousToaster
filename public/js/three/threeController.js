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
        ThreeFactory.createScene(i, data, scene, $scope.objects, $scope.hit);
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

    $scope.hit = function(){
      console.log("OWRKOING")
      Modal.open({
         content: '<strong>Default modal!</strong>
                   <br />Testing the modal.
                   <br /><
                   br />Loreum ipsum dolorem the quick brown 
                   fox jumped over the lazy dog.
                   <br /><br />Yes its true.',
         draggable: true,
         openCallback: function () {
           alert('This is an example of the use of openCallback');
         }
       });

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

