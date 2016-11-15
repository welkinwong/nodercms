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

          _.map(data.media, function (medium) {
            var fileNameLast = _.get(medium.fileName.match(/^.+\.(\w+)$/), 1);

            medium.fileNameLast = fileNameLast;
            medium.isImage = false;

            switch (fileNameLast) {
              case 'jpg':
              case 'jpeg':
              case 'png':
              case 'gif':
                medium.isImage = true;
            }
          });

          $scope.media = data.media;
          $scope.totalPages = data.pages;
        });
    }; $scope.loadMedia();

    /**
     * 监控当前页面改变
     */
    $scope.$watch('currentPage', function (newPage, oldPage) {
      if (newPage !== oldPage) $scope.loadMedia();
    });

    /**
     * 删除媒体
     */
    $scope.deleteMedium = function () {
      $scope.transmitting = true;

      $http.delete('/api/media/' + $scope.deleteMediumId)
        .then(function () {
          $scope.loadMedia();

          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '删除媒体成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除媒体失败'
          });
        });
    };
  }
]);