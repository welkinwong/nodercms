/**
 * Roles Controller
 */
angular.module('controllers').controller('rolesController', ['$scope', '$http',
  function ($scope, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.roles = [];
    $scope.deleteRoleId = '';

    /**
     * 获取角色列表
     */
    $http.get('/api/roles')
      .success(function (data) {
        var deleteRoleIndex;

        for (var i = 0; i < data.length; i++) {
          for (var _i = 0; _i < data[i].authorities.length; _i++) {
            if (data[i].authorities[_i] === 100000) {
              deleteRoleIndex = i;

              break;
            }
          }

          if (!isNaN(deleteRoleIndex)) {
            data.splice(deleteRoleIndex, 1);

            break;
          }
        }

        $scope.roles = data;
      })
      .error(function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '获取角色列表失败'
        });
      });

    /**
     * 翻译系统键
     * @param  {Number} authority 权限
     */
    $scope.translate = function (authority) {
      for (var i = 0; i < $scope.authorities.length; i++) {
        if (authority === $scope.authorities[i].authority) {
          return $scope.authorities[i].name;
        }
      }
    };

    /**
     * 删除角色
     */
    $scope.deleteRole = function () {
      $http.delete('/api/roles/' + $scope.deleteRoleId)
        .success(function () {
          for (var i = 0; i < $scope.roles.length; i++) {
            if ($scope.deleteRoleId === $scope.roles[i]._id) {
              $scope.roles.splice(i, 1);

              $scope.$emit('notification', {
                type: 'success',
                message: '删除角色成功'
              });

              return $('#deleteModal').modal('hide');
            }
          }
        })
        .error(function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除角色失败'
          });
        });
    };
  }
]);