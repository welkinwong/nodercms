/**
 * Login Controller
 */
angular.module('controllers').controller('loginController', ['$scope', '$timeout', '$state', '$http',
  function ($scope, $timeout, $state, $http) {
    'use strict';

    $scope.submitLogin = function () {
      $scope.transmitting = true;

      $http.post('/api/login', {
        email: $scope.email,
        password: $scope.password
      }).success(function (result, status) {
        $state.go('main');
      }).error(function (result, status) {
        if (result && result.error && result.error.code === 'WRONG_EMAIL_OR_PASSWORD') {
          $scope.animateShake = true;
          $timeout(function () {
            $scope.animateShake = false;
            $scope.transmitting = false;
          }, 600);
        } else {
          $scope.transmitting = false;
        }
      });
    };
  }
]);