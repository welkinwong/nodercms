/**
 * Roles Change Controller
 */
angular.module('controllers').controller('rolesChangeController', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope.name = '';
    $scope.description = '';
    $scope.authorities = [];

    /**
     * 获取权限列表和当前角色
     */
    async.parallel({
      // 获取权限列表
      authorities: function (callback) {
        $http.get('/api/authorities')
          .success(function (data) {
            for (var i = 0; i < data.length; i++) {
              if (data[i].authority === 10000) {
                data.splice(i, 1);
              } else {
                data[i].required = false;
              }
            }

            callback(null, data);
          })
          .error(function () {
            callback('获取权限失败');
          });
      },

      // 获取当前角色
      role: function (callback) {
        if ($stateParams._id) {
          $scope.action = 'update';
          $http.get('/api/roles/' + $stateParams._id)
            .success(function (data) {
              callback(null, data);
            })
            .error(function () {
              callback('获取角色失败');
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
      
      $scope.authorities = results.authorities;
      
      if ($stateParams._id && results.role) {
        $scope.name = results.role.name;
        $scope.description = results.role.description;

        for (var i = 0; i < $scope.authorities.length ; i++) {
          for (var _i = 0; _i < results.role.authorities.length; _i++) {
            if ($scope.authorities[i].authority === results.role.authorities[_i]) {
              $scope.authorities[i].required = true;
            }
          }
        }
      } else if ($stateParams._id) {
        $state.go('main.roles');
      }
    });

    /**
     * 保存角色
     */
    $scope.saveRole = function () {
      $scope.transmitting = true;
      
      var role = {
        name: $scope.name,
        description: $scope.description,
        authorities: []
      };

      for (var i = 0; i < $scope.authorities.length; i++) {
        if ($scope.authorities[i].required) {
          role.authorities.push($scope.authorities[i].authority);
        }
      }

      if ($stateParams._id) {
        role._id = $stateParams._id;
        
        $http.put('/api/roles/' + $stateParams._id, role)
          .success(function () {
            for (var i = 0; i < $scope.$parent.roles.length; i++) {
              if ($scope.$parent.roles[i]._id === role._id) {
                $scope.$parent.roles[i] = role;

                $scope.$emit('notification', {
                  type: 'success',
                  message: '保存角色成功'
                });

                return $state.go('main.roles');
              }
            }
          })
          .error(function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存角色失败'
            });
          });
      } else {
        $http.post('/api/roles', role)
          .success(function (data) {
            role._id = data._id;
            $scope.$parent.roles.push(role);

            $scope.$emit('notification', {
              type: 'success',
              message: '创建角色成功'
            });

            $state.go('main.roles');
          })
          .error(function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '创建角色失败'
            });
          });
      }
    };
  }
]);