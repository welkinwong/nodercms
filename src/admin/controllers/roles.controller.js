/**
 * Roles Controller
 */
angular.module('controllers').controller('roles', ['$scope', '$http', 'account',
  function ($scope, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.roles = [];
    $scope.deleteRoleId = '';
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.roles.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 获取角色列表
     */
    $http.get('/api/roles')
      .then(function (res) {
        var data = _.reject(res.data, function (authority) {
          var admin = _.find(authority.authorities, function (authority) {
            return authority === 100000;
          });

          return admin;
        });

        $scope.roles = data;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '获取角色列表失败'
        });
      });

    /**
     * 删除角色
     */
    $scope.deleteRole = function () {
      $scope.transmitting = true;

      $http.delete('/api/roles/' + $scope.deleteRoleId)
        .success(function () {
          _.pullAllBy($scope.roles, [{ _id: $scope.deleteRoleId } ], '_id');

          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '删除角色成功'
          });
        })
        .error(function () {
          $('#deleteModal').modal('hide');

          $scope.$emit('notification', {
            type: 'danger',
            message: '删除角色失败'
          });
        });
    };
  }
]);