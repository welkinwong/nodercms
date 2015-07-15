/**
 * Content Model Change Controller
 */
angular.module('controllers').controller('contentModelChangeController', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope.keyFormAction = '';
    $scope.keyIndex = '';
    $scope.name = '';
    $scope.description = '';
    $scope.system = {
      thumbnail: true,
      content: true,
      tags: true,
      gallery: false
    };
    $scope.extensions = [];
    $scope.keyType = [
      {
        name: '文本框',
        type: 'textInput'
      }
    ];
    $scope.key = {
      key: '',
      name: '',
      type: 'textInput',
      description: ''
    };
    $scope.keyNonUnique = false;

    $scope.$watch('key.key', function () {
      if ($scope.keyFormAction === 'add') {
        for (var i = 0; i < $scope.extensions.length; i++) {
          if ($scope.key.key === $scope.extensions[i].key) {
            return $scope.keyNonUnique = true;
          }
        }
      }

      $scope.keyNonUnique = false;
    });

    if ($stateParams._id) {
      $scope.action = 'update';

      $http.get('/api/models/' + $stateParams._id)
        .success(function (data) {
          if (data) {
            $scope.name = data.name;
            $scope.description = data.description;
            $scope.system = {
              thumbnail: data.system.thumbnail,
              content: data.system.content,
              tags: data.system.tags,
              gallery: data.system.gallery
            }
            $scope.extensions = data.extensions;
          } else {
            $state.go('main.contentModels')
          }
        })
        .error(function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '获取内容模型失败'
          });
        });
    }

    /**
     * 添加 / 修改键
     * @param  {Object} key    选中键
     * @param  {Number} $index 键下标
     */
    $scope.keyModel = function (key, $index) {
      if (key) {
        $scope.keyFormAction = 'edit';
        $scope.keyIndex = $index;

        $scope.key = angular.copy(key);
      } else {
        $scope.keyFormAction = 'add';
        $scope.keyForm.$setPristine();

        $scope.key = {
          key: '',
          name: '',
          type: 'textInput',
          description: ''
        };
      }

      $('#keyModal').modal('show');
    };

    /**
     * 删除键
     */
    $scope.deleteKey = function () {
      if ($scope.keyFormAction === 'edit') {
        $scope.extensions.splice($scope.keyIndex, 1);

        $('#keyModal').modal('hide');
      }
    };

    /**
     * 保存键
     */
    $scope.saveKey = function () {
      if ($scope.keyFormAction === 'add') {
        $scope.extensions.push($scope.key);
      } else if ($scope.keyFormAction === 'edit') {
        $scope.extensions[$scope.keyIndex] = $scope.key;
      }

      $('#keyModal').modal('hide');
    };

    /**
     * 保存模型
     */
    $scope.saveModel = function () {
      $scope.transmitting = true;
      
      var model = {
        name: $scope.name,
        description: $scope.description,
        type: 'content',
        system: $scope.system,
        extensions: $scope.extensions
      };

      if ($stateParams._id) {
        model._id = $stateParams._id;

        $http.put('/api/models/' + $stateParams._id, model)
          .success(function () {
            for (var i = 0; i < $scope.$parent.models.length; i++) {
              if (model._id === $scope.$parent.models[i]._id) {
                $scope.$parent.models[i] = model;

                $scope.$emit('notification', {
                  type: 'success',
                  message: '保存内容模型成功'
                });

                return $state.go('main.contentModels');
              }
            }
          })
          .error(function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存内容模型失败'
            });
          });
      } else {
        $http.post('/api/models', model)
          .success(function (data) {
            model._id = data._id;
            
            $scope.$parent.models.push(model);

            $scope.$emit('notification', {
              type: 'success',
              message: '保存内容模型成功'
            });

            $state.go('main.contentModels');
          })
          .error(function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存内容模型失败'
            });
          });
      }
    };
  }
]);