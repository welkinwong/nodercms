/**
 * Content Model Change Controller
 */
angular.module('controllers').controller('contentModelChange', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = true;
    $scope.action = 'create';
    $scope._id = $stateParams._id;
    $scope.keyFormAction = '';
    $scope.keyIndex = '';
    $scope.name = '';
    $scope.description = '';
    $scope.system = {
      thumbnail: true,
      abstract: true,
      content: true,
      tags: true
    };
    $scope.thumbnailSize = {
      width: 400,
      height: 300
    };
    $scope.extensions = [];
    $scope.keyType = [
      {
        name: '文本框',
        type: 'text'
      },
      {
        name: '数字框',
        type: 'number'
      },
      {
        name: '文本域',
        type: 'textarea'
      },
      {
        name: '下拉框',
        type: 'select'
      },
      {
        name: '媒体',
        type: 'media'
      }
    ];
    $scope.key = {
      key: '',
      name: '',
      type: 'text',
      description: '',
      mixed: {
        select: [],
        limit: 4
      }
    };
    $scope.keyTypeSelect = {
      name: '',
      value: ''
    };
    $scope.keyTypeSelectInvalid = {
      name: true,
      value: true
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

    $('#keyForm')
      .on('input', '#keyTypeSelectName', function () {
        $scope.$apply(function () {
          $scope.keyTypeSelectInvalid.name = false;
        });
      })
      .on('blur', '#keyTypeSelectName', function () {
        $scope.$apply(function () {
          if (!$scope.keyTypeSelect.name) {
            $scope.keyTypeSelectInvalid.name = true;
          }
        });
      })
      .on('input', '#keyTypeSelectValue', function () {
        $scope.$apply(function () {
          $scope.keyTypeSelectInvalid.value = false;
        });
      })
      .on('blur', '#keyTypeSelectValue', function () {
        $scope.$apply(function () {
          if (!$scope.keyTypeSelect.value) {
            $scope.keyTypeSelectInvalid.value = true;
          }
        });
      });

    if ($stateParams._id) {
      $scope.action = 'update';

      $http.get('/api/models/' + $stateParams._id)
        .then(function (res) {
          var data = res.data;

          if (data) {
            $scope.name = data.name;
            $scope.description = data.description;
            $scope.system = data.system;
            if (data.system.thumbnail && data.mixed && data.mixed.thumbnailSize) $scope.thumbnailSize = data.mixed.thumbnailSize;
            $scope.extensions = data.extensions;

            $scope.transmitting = false;
          } else {
            $state.go('main.contentModels');
          }
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '获取内容模型失败'
          });
        });
    } else {
      $scope.transmitting = false;
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
        $scope.keyForm.$setUntouched();

        $scope.key = {
          key: '',
          name: '',
          type: 'text',
          description: '',
          mixed: {
            select: [],
            limit: 4
          }
        };
      }

      $('#keyModal').modal('show');
    };

    /**
     * 添加键下拉框选项
     */
    $scope.addKeyTypeSelect = function () {
      $scope.key.mixed.select = $scope.key.mixed.select || [];
      $scope.key.mixed.select.push(angular.copy($scope.keyTypeSelect));
      $scope.keyTypeSelect = {
        name: '',
        value: ''
      };
      $scope.keyTypeSelectInvalid = {
        name: true,
        value: true
      };
      $scope.keyForm.keyTypeSelectName.$setUntouched();
      $scope.keyForm.keyTypeSelectValue.$setUntouched();
    };

    /**
     * 移除键下拉框选项
     * @param  {Number} $index 键下拉框选项下标
     */
    $scope.deleteKeyTypeSelect = function (index) {
      $scope.key.mixed.select.splice(index, 1);
    };

    /**
     * 删除键
     */
    $scope.deleteKey = function (index) {
      $scope.extensions.splice(index, 1);
    };

    /**
     * 保存键
     */
    $scope.saveKey = function () {
      // 清理不必要的键
      switch ($scope.key.type) {
        case 'text':
        case 'number':
        case 'textarea':
          delete $scope.key.mixed.select;
          delete $scope.key.mixed.limit;
          break;
        case 'select':
          delete $scope.key.mixed.limit;
          break;
        case 'media':
          delete $scope.key.mixed.select;
      }

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
        type: 'content',
        name: $scope.name,
        description: $scope.description,
        system: $scope.system,
        extensions: $scope.extensions
      };

      if ($scope.system.thumbnail) {
        model.mixed = model.mixed || {};
        model.mixed.thumbnailSize = $scope.thumbnailSize;
      }

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

                $scope.$emit('mainCategoriesUpdate');

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
          .success(function (result) {
            model._id = result._id;
            
            $scope.$parent.models.push(model);

            $scope.$emit('notification', {
              type: 'success',
              message: '保存内容模型成功'
            });

            $scope.$emit('mainCategoriesUpdate');

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