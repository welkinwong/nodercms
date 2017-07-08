/**
 * Sign In Controller
 */
angular.module('controllers').controller('signIn', ['$scope', '$timeout', '$state', '$http',
  function ($scope, $timeout, $state, $http) {
    'use strict';

    $scope.transmitting = false;
    $scope.email = '';
    $scope.password = '';
    $scope.autoSignIn = false;
    $scope.wrongEmailOrPassword = false;

    function resetEmailAndPassword () {
      $scope.wrongEmailOrPassword = false;
    }

    $scope.$watch('email', resetEmailAndPassword);
    $scope.$watch('password', resetEmailAndPassword);

    $scope.signIn = function () {
      $scope.transmitting = true;

      $http.put('/api/account/sign-in', {
        email: $scope.email,
        password: $scope.password,
        autoSignIn: $scope.autoSignIn
      }).then(function () {
        $state.go('main');
      }, function (res) {
        $scope.wrongEmailOrPassword = true;
        $scope.animateShake = true;
        $timeout(function () {
          $scope.animateShake = false;
          $scope.transmitting = false;
        }, 600);
      });
    };
  }
]);