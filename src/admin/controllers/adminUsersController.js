/**
 * Admin Users Controller
 */
angular.module('controllers').controller('adminUsersController', ['$scope', '$timeout', '$state', '$http',
  function ($scope, $timeout, $state, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.users = [];
    $scope.deleteUserId = '';

    /**
     * 读取后台用户
     */
    $http.get('/api/adminUsers')
      .success(function (result) {
        $scope.users = result;
      })
      .error(function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取后台用户失败'
        });
      });

    /**
     * 删除后台用户
     */
    $scope.deleteUser = function () {
      $http.delete('/api/adminUsers/' + $scope.deleteUserId)
        .success(function () {
          for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.deleteUserId === $scope.users[i]._id) {
              $scope.users.splice(i, 1);

              $scope.$emit('notification', {
                type: 'success',
                message: '删除用户成功'
              });

              return $('#deleteModal').modal('hide');
            }
          }
        })
        .error(function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除用户失败'
          });
        });
    };
  }
]);