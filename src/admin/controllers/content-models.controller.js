/**
 * Content Models Controller
 */
angular.module('controllers').controller('contentModels', ['$scope', '$http', 'account',
  function ($scope, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.models = [];
    $scope.deleteModelId = '';
    $scope.systemKey = [
      {
        name: 'thumbnail',
        value: '缩略图'
      },
      {
        name: 'abstract',
        value: '摘要'
      },
      {
        name: 'content',
        value: '内容'
      },
      {
        name: 'tags',
        value: '标签'
      }
    ];
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.contentModels.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 读取内容模型列表
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
     * 删除内容模型
     */
    $scope.deleteModel = function () {
      $scope.transmitting = true;

      $http.delete('/api/models/' + $scope.deleteModelId)
        .then(function () {
          for (var i = 0; i < $scope.models.length; i++) {
            if ($scope.deleteModelId === $scope.models[i]._id) {
              $scope.models.splice(i, 1);

              $('#deleteModal').modal('hide');

              $scope.transmitting = false;

              return $scope.$emit('notification', {
                type: 'success',
                message: '删除内容模型成功'
              });
            }
          }
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除内容模型失败'
          });
        });
    };
  }
]);