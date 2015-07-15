/**
 * Content Models Controller
 */
angular.module('controllers').controller('contentModelsController', ['$scope', '$http', '$state',
  function ($scope, $http, $state) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.models = [];
    $scope.deleteModelId = '';

    /**
     * 读取内容模型列表
     */
    $http.get('/api/models')
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
     * 翻译系统键
     * @param  {String} key 系统键
     */
    $scope.translate = function (key) {
      var systemKeyZh = {
        thumbnail: '缩略图',
        content: '内容',
        tags: '标签',
        gallery: '图集'
      };

      for (var keyZh in systemKeyZh) {
        if (keyZh === key) {
          return systemKeyZh[keyZh];
        }
      }
    };

    /**
     * 删除内容模型
     */
    $scope.deleteModel = function () {
      $http.delete('/api/models/' + $scope.deleteModelId)
        .success(function () {
          for (var i = 0; i < $scope.models.length; i++) {
            if ($scope.deleteModelId === $scope.models[i]._id) {
              $scope.models.splice(i, 1);

              $scope.$emit('notification', {
                type: 'success',
                message: '删除内容模型成功'
              });

              return $('#deleteModal').modal('hide');
            }
          }
        })
        .error(function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除内容模型失败'
          });
        });
    };
  }
]);