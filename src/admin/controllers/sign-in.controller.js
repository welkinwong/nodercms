/**
 * Sign In Controller
 */
angular.module('controllers').controller('signIn', ['$scope', '$timeout', '$state', '$http',
  function ($scope, $timeout, $state, $http) {
    'use strict';

    $scope.transmitting = false;
    $scope.email = '';
    $scope.password = '';
    $scope.captcha = '';
    $scope.captchaData = '';
    $scope.autoSignIn = false;
    $scope.wrongEmailOrPassword = false;
    $scope.wrongCaptcha = false;

    function resetEmailAndPassword () {
      $scope.wrongEmailOrPassword = false;
    }

    function resetCaptcha () {
      $scope.wrongCaptcha = false;
    }

    $scope.$watch('email', resetEmailAndPassword);
    $scope.$watch('password', resetEmailAndPassword);
    $scope.$watch('captcha', resetCaptcha);

    $scope.getCaptcha = function () {
      $http.get('/api/account/captcha')
        .then(function (res) {
          $scope.captchaData = res.data;
        });
    }; $scope.getCaptcha();

    $scope.signIn = function () {
      $scope.transmitting = true;

      $http.put('/api/account/sign-in', {
        email: $scope.email,
        password: $scope.password,
        captcha: $scope.captcha.toLowerCase(),
        autoSignIn: $scope.autoSignIn
      }).then(function () {
        $state.go('main');
      }, function (res) {
        $scope.getCaptcha();

        var data = res.data;

        switch (_.get(data, 'error.code')) {
          case 'WRONG_EMAIL_OR_PASSWORD':
            $scope.wrongEmailOrPassword = true;
            break;
          case 'WRONG_CAPTCHA':
            $scope.wrongCaptcha = true;
        }

        $scope.animateShake = true;
        $timeout(function () {
          $scope.animateShake = false;
          $scope.transmitting = false;
        }, 600);
      });
    };
  }
]);