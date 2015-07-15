/**
 * Admin Users Change Controller
 */
angular.module('controllers').controller('adminUsersChangeController', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope.checkEmailing = false;
    $scope.inputing = false;
    $scope.email = '';
    $scope.oldEmail = '';
    $scope.nickname = '';
    $scope.password = '';
    $scope.roles = [];
    $scope.role = '';

    /**
     * 读取角色与用户
     */
    async.parallel({
      // 获取权限列表
      roles: function (callback) {
        $http.get('/api/roles')
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback('获取角色列表失败');
          });
      },

      // 获取当前用户
      user: function (callback) {
        if ($stateParams._id) {
          $scope.action = 'update';

          $http.get('/api/adminUsers/' + $stateParams._id)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback('获取用户失败');
            });
        } else {
          callback(null);
        }
      }
    }, function (err, results) {
      if (err) {
        return $scope.$emit('notification', {
          type: 'danger',
          message: err
        });
      }

      $scope.roles = results.roles;

      if ($stateParams._id && results.user) {
        $scope.oldEmail = angular.copy(results.user.email);
        $scope.email = results.user.email;
        $scope.nickname = results.user.nickname;
        $scope.role = results.user.role._id;
      } else if ($stateParams._id) {
        $state.go('main.adminUsers');
      }
    });

    /**
     * 保存用户
     */
    $scope.saveUser = function () {
      $scope.transmitting = true;

      var user = {
        email: $scope.email.toLowerCase(),
        nickname: $scope.nickname,
        role: $scope.role
      };

      function bindRole () {
        for (var i = 0; i < $scope.roles.length; i++) {
          if (user.role === $scope.roles[i]._id) {
            user.role = $scope.roles[i];
            break;
          }
        }
      }

      if ($scope.password) user.password = $scope.password;

      if ($stateParams._id) {
        user._id = $stateParams._id;

        $http.put('/api/adminUsers/' + $stateParams._id, user)
          .success(function () {
            bindRole();

            for (var i = 0; i < $scope.$parent.users.length; i++) {
              if ($scope.$parent.users[i]._id === user._id) {
                $scope.$parent.users[i] = user;

                $scope.$emit('notification', {
                  type: 'success',
                  message: '保存用户成功'
                });

                return $state.go('main.adminUsers');
              }
            }
          })
          .error(function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存用户失败'
            });
          });
      } else {
        $http.post('/api/adminUsers', user)
          .success(function (data) {
            bindRole();

            user._id = data._id;

            $scope.$parent.users.push(user);

            $scope.$emit('notification', {
              type: 'success',
              message: '创建用户成功'
            });

            return $state.go('main.adminUsers');
          })
          .error(function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '创建用户失败'
            });
          });
      }
    };

  }
]);