/**
 * Media Controller
 */
angular.module('controllers').controller('media', ['$scope', '$state', '$stateParams', '$http', 'account',
  function ($scope, $state, $stateParams, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.media = [];
    $scope.currentPage = 1;
    $scope.totalPages = 0;
    $scope.deleteMediumId = '';
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.media.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 读取媒体列表
     */
    $scope.loadMedia = function () {
      $http.get('/api/media', { params: { currentPage: $scope.currentPage, pageSize: 20 } })
        .then(function (res) {
          var data = res.data;

          $scope.media = data.media;
          $scope.totalPages = data.pages;

          if ($scope.transmitting) $scope.transmitting = false;
        });
    }; $scope.loadMedia();

    /**
     * 监控当前页面改变
     */
    $scope.$watch('currentPage', function () {
      $scope.loadMedia();
    });

    /**
     * 删除媒体
     */
    $scope.deleteMedium = function () {
      $scope.transmitting = true;

      $http.delete('/api/media/' + $scope.deleteMediumId)
        .then(function () {
          $scope.loadMedia();

          $scope.$emit('notification', {
            type: 'success',
            message: '删除媒体成功'
          });

          $('#deleteModal').modal('hide');
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除媒体失败'
          });
        });
    };
  }
]);