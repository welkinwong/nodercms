/**
 * Roles Change Controller
 */
angular.module('controllers').controller('rolesChange', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope._id = $stateParams._id;
    $scope.name = '';
    $scope.description = '';
    $scope.authorities = [];

    /**
     * 获取权限列表和当前角色
     */
    async.parallel({
      authorities: function (callback) {
        $http.get('/api/authorities')
          .then(function (res) {
            var data = _.reject(res.data, { code: 100000 });

            callback(null, data);
          }, function () {
            callback('获取权限失败');
          });
      },
      role: function (callback) {
        if ($stateParams._id) {
          $scope.action = 'update';

          $http.get('/api/roles/' + $stateParams._id)
            .then(function (res) {
              var data = res.data;

              callback(null, data);
            }, function () {
              callback('获取角色失败');
            });
        } else {
          callback(null);
        }
      }
    }, function (err, results) {
      if (err) {
        $scope.$emit('notification', {
          type: 'danger',
          message: err
        });
        return false;
      }

      $scope.authorities = _.map(results.authorities, function (authority) {
        authority.select = 0;
        return authority;
      });

      if (results.role) {
        $scope.name = results.role.name;
        $scope.description = results.role.description;

        _.forEach($scope.authorities, function (authority) {
          authority.select = 0;

          var read = _.find(authority.authorities, { name: 'read' }).code;
          var edit = _.find(authority.authorities, { name: 'edit' }).code;

          var userRead = _.find(results.role.authorities, function (authority) {
            return authority === read;
          });

          var userEdit = _.find(results.role.authorities, function (authority) {
            return authority === edit;
          });

          if (userRead && userEdit) {
            authority.select = 2;
          } else if (userRead) {
            authority.select = 1;
          }
        });
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

      _.forEach($scope.authorities, function (authority) {
        switch (authority.select) {
          case 0: break;
          case 1:
            _.forEach(authority.authorities, function (authority) {
              if (authority.name === 'read') role.authorities.push(authority.code);
            });
            break;
          case 2:
            _.forEach(authority.authorities, function (authority) {
              if (authority.name === 'read') role.authorities.push(authority.code);
              if (authority.name === 'edit') role.authorities.push(authority.code);
            });
        }
      });

      if ($stateParams._id) {
        role._id = $stateParams._id;
        
        $http.put('/api/roles/' + $stateParams._id, role)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '保存角色成功'
            });

            $scope.$emit('mainUserUpdate');

            $state.go('main.roles', null, { reload: 'main.roles'});
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存角色失败'
            });
          });
      } else {
        $http.post('/api/roles', role)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '新增角色成功'
            });

            $scope.$emit('mainUserUpdate');

            $state.go('main.roles', null, { reload: 'main.roles'});
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '新增角色失败'
            });
          });
      }
    };
  }
]);