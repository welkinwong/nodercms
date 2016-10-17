/**
 * Trash Controller
 */
angular.module('controllers').controller('trash', ['$scope', '$state', '$stateParams', '$http', 'account',
  function ($scope, $state, $stateParams, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.category = {};
    $scope.contents = [];
    $scope.currentPage = 1;
    $scope.totalPages = 0;
    $scope.deleteContentId = '';
    $scope.recoveryContentId = '';
    $scope.statusType = [
      {
        name: '草稿',
        value: 'draft'
      },
      {
        name: '已发布',
        value: 'pushed'
      }
    ];
    $scope.editAuth = false;

    /**
     * 读取用户编辑权限
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.contents.edit;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 读取内容列表
     */
    $scope.loadContents = function () {
      $http.get('/api/contents', { params: { deleted: true, currentPage: $scope.currentPage, pageSize: 20 } })
        .then(function (res) {
          var data = res.data;
          $scope.contents = data.contents;
          $scope.totalPages = data.pages;
        });
    }; $scope.loadContents();

    /**
     * 监控当前页面改变
     */
    $scope.$watch('currentPage', function () {
      $scope.loadContents();
    });

    /**
     * 恢复内容
     */
    $scope.recoveryContent = function () {
      $scope.transmitting = true;

      var data = {
        deleted: false,
        part: true
      };

      $http.put('/api/contents/' + $scope.recoveryContentId, data)
        .then(function () {
          $scope.loadContents();

          $('#recoveryModal').modal('hide');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '恢复内容成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '恢复内容失败'
          });
        });
    };

    /**
     * 删除内容
     */
    $scope.deleteContent = function () {
      $scope.transmitting = true;

      $http.delete('/api/contents/' + $scope.deleteContentId)
        .then(function () {
          $scope.loadContents();

          $('#deleteModal').modal('hide');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '删除内容成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除内容失败'
          });
        });
    };

    /**
     * 删除当前页内容
     */
    $scope.deleteListContent = function () {
      $scope.transmitting = true;

      $http.delete('/api/contents', { params: { ids: _.map($scope.contents, '_id') } })
        .then(function () {
          $scope.loadContents();

          $('#deleteListModal').modal('hide');

          $scope.transmitting = false;

          $scope.$emit('notification', {
            type: 'success',
            message: '删除内容成功'
          });
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '删除内容失败'
          });
        });
    };
  }
]);