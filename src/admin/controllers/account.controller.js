/**
 * Account Controller
 */
angular.module('controllers').controller('account', ['$scope', '$rootScope', '$state', '$stateParams', '$http', 'account',
  function ($scope, $rootScope, $state, $stateParams, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = true;
    $scope.email = '';
    $scope.oldEmail = '';
    $scope.nickname = '';
    $scope.password = '';
    $scope.confirmpwd = '';
    $scope.role = '';
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.account.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 获取个人信息
     */
    account.get()
      .then(function (user) {
        $scope.email = user.email;
        $scope.oldEmail = user.email;
        $scope.nickname = user.nickname;
        $scope.role = user.role;

        $scope.transmitting = false;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '帐号更新失败'
        });
      });

    /**
     * 更新个人信息
     */
    $scope.update = function () {
      $scope.transmitting = true;

      var user = {
        nickname: $scope.nickname,
        email: $scope.email
      };

      if ($scope.password) user.password = $scope.password;

      $http.put('/api/account', user)
        .then(function () {
          account.reset();

          $scope.$emit('mainUserUpdate');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '帐号更新成功'
          });
        }, function () {
          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'danger',
            message: '帐号更新失败'
          });
        });
    };
  }
]);