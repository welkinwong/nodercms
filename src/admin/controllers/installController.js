/**
 * loginController
 */
angular.module('controllers').controller('installController', ['$scope', '$state', '$http',
  function ($scope, $state, $http) {
    'use strict';
    /**
     * 初始化变量
     */
    $scope.title = '';
    $scope.email = '';
    $scope.nickname = '';
    $scope.password = '';

    /**
     * 提交 install
     */
    $scope.submitInstall = function () {
      $http.post('/api/install', {
        title: $scope.title,
        email: $scope.email.toLowerCase(),
        nickname: $scope.nickname,
        password: $scope.password
      })
      .success(function (data, status) {
        $state.go('main');
      })
      .error(function (data, status) {
        if (data.message) {
          console.log(data.message);
        }
      });
    };
  }
]);