/**
 * Categories Change Controller
 */
angular.module('controllers').controller('categoriesChangeController', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';
    $scope.inputing = false;
    $scope.checkDirectorying = false;
    $scope.types = [{
      type: 'channel',
      name: '频道'
    }, {
      type: 'column',
      name: '栏目'
    }, {
      type: 'page',
      name: '单页'
    }, {
      type: 'link',
      name: '链接'
    }];
    $scope.models = [];
    $scope.viewfiles = [];
    $scope.type = 'column';
    $scope.name = '';
    $scope.sort = 0;
    $scope.isShow = true;
    $scope.directory = '';
    $scope.oldDirectory = '';
    $scope.model = '';
    $scope.views = {
      list: '',
      content: ''
    };
    $scope.parentCategory = undefined;
    $scope.keywords =  '';
    $scope.description = '';
    $scope._id = $stateParams._id ? $stateParams._id : 'null';

    /**
     * 读取内容模型
     */
    $http.get('/api/models', {
      params: {
        type: 'content'
      }
    })
    .success(function (data) {
      $scope.models = data;
    })
    .error(function () {
      $scope.$emit('notification', {
        type: 'danger',
        message: '读取内容模型失败'
      });
    });

    /**
     * 读取模板列表
     */
    $http.get('/api/views')
    .success(function (data) {
      $scope.viewfiles = data;
    })
    .error(function () {
      $scope.$emit('notification', {
        type: 'danger',
        message: '读取模板失败'
      });
    });

    /**
     * 读取当前分类
     * @param  {String} $stateParams._id 分类ID
     */
    if ($stateParams._id) {
      $scope.action = 'update';

      $http.get('/api/categories/' + $stateParams._id)
        .success(function (data) {
          if (data) {
            $scope.type = data.type;
            $scope.name = data.name;
            $scope.oldDirectory = angular.copy(data.directory);
            $scope.directory = data.directory;
            $scope.isShow = data.isShow;
            $scope.sort = data.sort;
            $scope.model = data.model && data.model._id || ''; 
            $scope.views = data.views;
            $scope.parentCategory = data.parentCategory || undefined;
            $scope.keywords =  data.keywords || '';
            $scope.description = data.description || '';
          } else {
            $state.go('main.categories');
          }
        })
        .error(function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '获取分类失败'
          });
        });
    }

    /**
     * 保存分类
     */
    $scope.saveCategory = function () {
      $scope.transmitting = true;

      var category = {
        type: $scope.type,
        name: $scope.name,
        directory: $scope.directory.toLowerCase(),
        isShow: $scope.isShow,
        sort: $scope.sort
      };

      switch ($scope.type) {
        case 'channel':
          category.views = $scope.views;
          category.keywords = $scope.keywords;
          category.description = $scope.description;

          break;
        case 'column':
          category.model = $scope.model;
          category.parentCategory = $scope.parentCategory || undefined;
          category.views = $scope.views;
          category.keywords = $scope.keywords;
          category.description = $scope.description;

          break;
        case 'page':
          category.isEdit = $scope.isEdit;
          category.parentCategory = $scope.parentCategory || undefined;
          category.views = $scope.views;
          category.keywords = $scope.keywords;
          category.description = $scope.description;

          break;
        case 'link':
          category.parentCategory = $scope.parentCategory || undefined;
      }

      if ($stateParams._id) {
        category._id = $stateParams._id;

        $http.put('/api/categories/' + $stateParams._id, category)
          .success(function () {
            if (category.model) {
              for (var i = 0; i < $scope.models.length; i++) {
                if (category.model === $scope.models[i]._id) {
                  category.model = $scope.models[i];

                  break;
                }
              }
            }

            for (var i = 0; i < $scope.$parent.categories.length; i++) {
              if (category._id === $scope.$parent.categories[i]._id) {
                $scope.$parent.categories[i] = category;
                $scope.$parent.categoriesSort();

                $scope.$emit('notification', {
                  type: 'success',
                  message: '保存分类成功'
                });

                $scope.$emit('mainCategoriesUpdate');

                return $state.go('main.categories');
              }
            }
          })
          .error(function () {
            $scope.transmitting = false;
            
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存分类失败'
            });
          });
      } else {
        $http.post('/api/categories', category)
          .success(function (data) {
            category._id = data._id;

            if (category.model) {
              for (var i = 0; i < $scope.models.length; i++) {
                if (category.model === $scope.models[i]._id) {
                  category.model = $scope.models[i];

                  break;
                }
              }
            }

            $scope.$parent.categories.push(category);
            $scope.$parent.categoriesSort();

            $scope.$emit('mainCategoriesUpdate');

            $state.go('main.categories');
          })
          .error(function () {
            $scope.transmitting = false;

            $scope.$emit('notification', {
              type: 'danger',
              message: '保存分类失败'
            });
          });
      }
    };
  }
]);