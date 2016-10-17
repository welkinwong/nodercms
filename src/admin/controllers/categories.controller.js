/**
 * Categories Controller
 */
angular.module('controllers').controller('categories', ['$scope', '$http', 'account',
  function ($scope, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.actionTitle = '';
    $scope.deleteCategoryId = '';
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
    $scope.categories = [];
    $scope.categoriesList = [];
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.categories.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 分类排序
     */
    $scope.categoriesSort = function () {
      var list = angular.copy($scope.categories);
      $scope.categoriesList = [];

      function tree (callback) {
        var source = _.partition(list, function(category) {
          if (category.path) {
            return category.path.split('/').length === 2;
          } else {
            return category.mixed.prePath.split('/').length === 2;
          }
        });

        var categories = _.sortBy(source[0], 'sort');
        var otherCategories = source[1];

        function loop (nodes) {
          return _.map(nodes, function (category) {
            var source = _.partition(otherCategories, function(otherCategory) {
              if (otherCategory.path) {
                return new RegExp('^' + category.path + '/[A-z0-9\-\_]+$').test(otherCategory.path);
              } else {
                return new RegExp('^' + category.path + '/$').test(otherCategory.mixed.prePath);
              }
            });

            otherCategories = source[1];

            if (!_.isEmpty(source[0])) {
              category.nodes = loop(_.sortBy(source[0], 'sort'));
            }

            return category;
          });
        }

        var tree = loop(categories);

        callback(tree);
      }

      // 按树进行排序
      tree(function (categories) {
        // 递归栏目
        (function loop (list, layer) {
          _.map(list, function (category, index) {
            // 最新栏目
            var category = angular.copy(category);

            // 删除子节点
            delete category._nodes;

            // 栏目缩进
            category.indent = { 'text-indent': layer * 1.5 + 'em' };

            // 栏目前缀
            if (index == list.length - 1 && layer != 0) {
              category.prefix = '└ ';
            } else if (layer != 0) {
              category.prefix = '├ ';
            }

            // PUSH当前栏目
            $scope.categoriesList.push(category);

            // 如果有子节点则递归
            if (category.nodes) loop(category.nodes, layer + 1);
          });
        })(categories, 0); // 初始值
      });
    };

    /**
     * 翻译
     * @param  {String} value 分类类型
     * @return {String}       分类名
     */

    $scope.translate = function (value) {
      for (var i = 0; i < $scope.types.length; i++) {
        if (value === $scope.types[i].type) {
          return $scope.types[i].name;
        }
      }
    };

    /**
     * 获取分类
     */
    $http.get('/api/categories')
      .then(function (res) {
        $scope.categories = res.data;
        $scope.categoriesSort();
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取分类失败'
        });
      });

    /**
     * 删除分类
     */
    $scope.deleteModel = function () {
      $scope.transmitting = true;

      $http.delete('/api/categories/' + $scope.deleteCategoryId)
        .success(function () {
          _.forEach($scope.categories, function (category, i) {
            if ($scope.deleteCategoryId === category._id) {
              $scope.categories.splice(i, 1);

              var regex = new RegExp('^' + category.path + '/', 'i');
              _.forEachRight($scope.categories, function (category, i) {
                if (regex.test(category.path)) {
                  $scope.categories.splice(i, 1);
                }
              });

              return false;
            }
          });

          $scope.categoriesSort();

          $scope.$emit('mainCategoriesUpdate');

          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '删除分类成功'
          });
        })
        .error(function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除分类失败'
          });
        });
    };
  }
]);