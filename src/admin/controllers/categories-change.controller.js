/**
 * Categories Change Controller
 */
angular.module('controllers').controller('categoriesChange', ['$scope', '$state', '$stateParams', '$http',
  function ($scope, $state, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = true;
    $scope.action = 'create';
    $scope._id = $stateParams._id;
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
    $scope.directory = '';
    $scope.pageSize = 15;
    $scope.url = '';
    $scope.oldPath = '';
    $scope.prePath = '';
    $scope.path = '';
    $scope.sort = 0;
    $scope.isShow = true;
    $scope.model = '';
    $scope.views = {
      layout: '',
      channel: '',
      column: '',
      content: '',
      page: ''
    };
    $scope.isEdit = true;
    $scope.keywords =  '';
    $scope.description = '';
    $scope._id = $stateParams._id ? $stateParams._id : 'null';

    /**
     * 翻译 Type
     */
    $scope.translateType = function (type) {
      return _.find($scope.types, { type: type }).name;
    };

    /**
     * 读取内容模型
     */
    $http.get('/api/models', {
      params: {
        type: 'content'
      }
    }).then(function (res) {
      $scope.models = res.data;
    }, function () {
      $scope.$emit('notification', {
        type: 'danger',
        message: '读取内容模型失败'
      });
    });

    /**
     * 读取模板列表
     */
    async.parallel({
      viewfiles: function (callback) {
        $http.get('/api/views')
          .then(function (res) {
            callback(null, res.data);
          }, function (res) {
            callback(res.data);
          });
      },
      category: function (callback) {
        if ($stateParams._id) {
          $scope.action = 'update';

          $http.get('/api/categories/' + $stateParams._id)
            .then(function (res) {
              var data = res.data;

              if (data) {
                callback(null, data)
              } else {
                $state.go('main.categories');
              }
            }, function (res) {
              callback(res.data);
            });
        } else {
          callback(null);
        }
      }
    }, function (err, results) {
      if (err) {
        $scope.$emit('notification', {
          type: 'danger',
          message: '获取分类失败'
        });

        $scope.transmitting = true;
        return false;
      }

      $scope.viewfiles = results.viewfiles;
      $scope.views.layout = 'layout-default';
      $scope.views.channel = 'channel-default';
      $scope.views.column = 'column-default';
      $scope.views.content = 'content-default';
      $scope.views.page = 'page-default';

      if (results.category) {
        $scope.type = results.category.type;
        $scope.name = results.category.name;
        $scope.directory = /[A-z0-9\_\-]+$/.exec(results.category.path)[0];

        if ($scope.type === 'link') {
          $scope.oldPath = angular.copy(results.category.mixed.prePath);
          var regexPath = /^\/[A-z0-9\_\-\/]+(?=[\/])/.exec(results.category.mixed.prePath);
          $scope.prePath = regexPath ? regexPath[0] : '';
        } else {
          $scope.oldPath = angular.copy(results.category.path);
          var regexPath = /^\/[A-z0-9\_\-\/]+(?=[\/])/.exec(results.category.path);
          $scope.prePath = regexPath ? regexPath[0] : '';
        }

        if (results.category.mixed) $scope.pageSize = results.category.mixed.pageSize;
        $scope.isShow = results.category.isShow;
        $scope.sort = results.category.sort;
        $scope.model = results.category.model && results.category.model._id || '';
        if (results.category.views) {
          $scope.views.layout = results.category.views.layout || 'layout-default';
          $scope.views.channel = results.category.views.channel || 'channel-default';
          $scope.views.column = results.category.views.column || 'column-default';
          $scope.views.content = results.category.views.content || 'content-default';
          $scope.views.page = results.category.views.page || 'page-default';
        }
        $scope.keywords = results.category.keywords || '';
        $scope.description = results.category.description || '';

        if (results.category.mixed) {
          $scope.url = results.category.mixed.url || '';
          $scope.isEdit = !_.isEmpty(results.category.mixed) ? results.category.mixed.isEdit : true;
        }
      }

      $scope.transmitting = false;
    });

    /**
     * 保存分类
     */
    $scope.saveCategory = function () {
      $scope.transmitting = true;

      var category = {
        type: $scope.type,
        name: $scope.name,
        isShow: $scope.isShow,
        sort: $scope.sort
      };

      switch ($scope.type) {
        case 'channel':
          category.path = '/' + $scope.directory.toLowerCase();
          category['views.layout'] = $scope.views.layout;
          category['views.channel'] = $scope.views.channel;
          category.keywords = $scope.keywords;
          category.description = $scope.description;

          break;
        case 'column':
          category.model = $scope.model;
          if ($scope.prePath) {
            category.path = $scope.prePath + '/' + $scope.directory.toLowerCase();
          } else {
            category.path = '/' + $scope.directory.toLowerCase();
          }
          category['mixed.pageSize'] = $scope.pageSize;
          category['views.layout'] = $scope.views.layout;
          category['views.column'] = $scope.views.column;
          category['views.content'] = $scope.views.content;
          category.keywords = $scope.keywords;
          category.description = $scope.description;

          break;
        case 'page':
          if ($scope.prePath) {
            category.path = $scope.prePath + '/' + $scope.directory.toLowerCase();
          } else {
            category.path = '/' + $scope.directory.toLowerCase();
          }
          category['views.layout'] = $scope.views.layout;
          category['views.page'] = $scope.views.page;
          category['mixed.isEdit'] = $scope.isEdit;
          category.keywords = $scope.keywords;
          category.description = $scope.description;

          break;
        case 'link':
          if ($scope.prePath) {
            category['mixed.prePath'] = $scope.prePath + '/';
          } else {
            category['mixed.prePath'] = '/';
          }
          category['mixed.url'] = $scope.url;
      }

      if ($stateParams._id) {
        category._id = $stateParams._id;

        $http.put('/api/categories/' + $stateParams._id, category)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '保存分类成功'
            });

            $scope.$emit('mainCategoriesUpdate');

            $state.go('main.categories', null, { reload: 'main.categories' });
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存分类失败'
            });
          });
      } else {
        $http.post('/api/categories', category)
          .then(function () {
            $scope.$emit('notification', {
              type: 'success',
              message: '新增分类成功'
            });

            $scope.$emit('mainCategoriesUpdate');

            $state.go('main.categories', null, { reload: 'main.categories' });
          }, function () {
            $scope.$emit('notification', {
              type: 'danger',
              message: '保存分类失败'
            });
          });
      }
    };
  }
]);