/**
 * Admin Users Controller
 */
angular.module('controllers').controller('adminUsers', ['$scope', '$timeout', '$state', '$http', 'account',
  function ($scope, $timeout, $state, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.users = [];
    $scope.deleteUserId = '';
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.adminUsers.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 读取后台用户
     */
    $http.get('/api/admin-users')
      .then(function (res) {
        var data = res.data;

        _.forEach(data, function (user) {
          var isSupAdmin = _.find(_.get(user, 'role.authorities'), function (authority) {
            return authority === 100000;
          });

          if (isSupAdmin) user.isSupAdmin = true;
        });

        $scope.users = res.data;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取后台用户失败'
        });
      });

    /**
     * 删除后台用户
     */
    $scope.deleteUser = function () {
      $scope.transmitting = true;

      $http.delete('/api/admin-users/' + $scope.deleteUserId)
        .then(function () {
          for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.deleteUserId === $scope.users[i]._id) {
              $scope.users.splice(i, 1);

              $('#deleteModal').modal('hide');

              $scope.transmitting = false;

              return $scope.$emit('notification', {
                type: 'success',
                message: '删除用户成功'
              });
            }
          }
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除用户失败'
          });
        });
    };
  }
]);