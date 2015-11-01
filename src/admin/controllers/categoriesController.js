/**
 * Categories Controller
 */
angular.module('controllers').controller('categoriesController', ['$scope', '$http',
  function ($scope, $http) {
    'use strict';

    /**
     * 初始化变量
     */
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

    /**
     * 分类排序
     */
    $scope.categoriesSort = function () {
      var categories = angular.copy($scope.categories);
      $scope.categoriesList = [];

      // 将分类重组为树
      function tree (callback) {
        var _categories = [];
        var count = 0;
        var callbackFlag = false;

        for (var i = 0; i < categories.length; i++) {
          if (!categories[i].parentCategory) {
            _categories.push(categories[i]);
            count++;
          }
        }

        (function loop (nodes) {
          for (var i = 0; i < nodes.length; i++) {
            for (var _i = 0; _i < categories.length; _i++) {
              if (nodes[i]._id === categories[_i].parentCategory) {
                nodes[i]._node = nodes[i]._node || [];
                nodes[i]._node.push(categories[_i]);

                count++;

                if (count < categories.length) {
                  loop(nodes[i]._node);
                } else if (count === categories.length) {
                  callbackFlag = true;
                  callback(_categories);
                }
              }

              // 循环至最后一个且没有返回树（只有顶级分类情况）
              if (!callbackFlag && count === categories.length && _i === categories.length - 1 && i === nodes.length -1) {
                callback(_categories);
              }
            }
          }
        })(_categories);
      };

      // 按树进行排序
      tree(function (categories) {
        // 递归栏目
        (function loop (list, directory, layer) {
          list.sort(function (a, b) {
            return a.sort - b.sort;
          });

          for (var i = 0; i < list.length; i++) {
            // 最新栏目
            var category = angular.copy(list[i]);

            // 删除子节点
            delete category._node;

            // 栏目缩进
            category.indent = { 'text-indent': layer * 1.5 + 'em' };

            // 栏目前缀
            if (i == list.length - 1 && layer != 0) {
              category.prefix = '└ ';
            } else if (layer != 0) {
              category.prefix = '├ ';
            }

            // 累加目录
            category.preCatDirectory = directory + category.directory;

            // PUSH当前栏目
            $scope.categoriesList.push(category);

            // 如果有子节点则递归
            if (list[i]._node) loop(list[i]._node, category.preCatDirectory + '/', layer + 1);
          };
        })(categories, '/', 0); // 初始值
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
      .success(function (data) {
        $scope.categories = data;
        $scope.categoriesSort();
      })
      .error(function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取分类失败'
        });
      });

    /**
     * 删除分类
     */
    $scope.deleteModel = function () {
      $http.delete('/api/categories/' + $scope.deleteCategoryId)
        .success(function () {
          for (var i = 0; i < $scope.categories.length; i++) {
            if ($scope.deleteCategoryId === $scope.categories[i]._id) {
              $scope.categories.splice(i, 1);

              for (var _i = $scope.categories.length - 1; _i > 0; _i--) {
                if ($scope.categories[_i].parentCategory === $scope.deleteCategoryId) {
                  $scope.categories[_i].parentCategory = null;
                }
              }

              $scope.categoriesSort();

              $scope.$emit('notification', {
                type: 'success',
                message: '删除分类成功'
              });

              return $('#deleteModal').modal('hide');
            }
          }
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