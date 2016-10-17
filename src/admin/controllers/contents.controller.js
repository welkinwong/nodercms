/**
 * Contents Controller
 */
angular.module('controllers').controller('contents', ['$scope', '$state', '$stateParams', '$http', 'account',
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
     * 读取当前栏目
     */
    $http.get('/api/categories/' + $stateParams.category)
      .then(function (res) {
        $scope.category = res.data;
      });

    /**
     * 读取内容列表
     */
    $scope.loadContents = function () {
      $http.get('/api/contents', { params: { _id: $stateParams.category, deleted: false, currentPage: $scope.currentPage, pageSize: 20 } })
        .then(function (res) {
          var data = res.data;

          $scope.contents = data.contents;
          $scope.totalPages = data.pages;
        }, function () {
          $scope.$emit('notification', {
            type: 'danger',
            message: '读取内容列表失败'
          });
        });
    }; $scope.loadContents();

    /**
     * 监控当前页面改变
     */
    $scope.$watch('currentPage', function () {
      $scope.loadContents();
    });

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
  }
]);