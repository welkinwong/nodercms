/**
 * siteInfoController
 */
angular.module('controllers').controller('siteInfo', ['$scope', '$http', 'account',
  function ($scope, $http, account) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = true;
    $scope.themes = [];
    $scope.theme = '';
    $scope.title = '';
    $scope.keywords = '';
    $scope.description = '';
    $scope.codeHeader = '';
    $scope.codeFooter = '';
    $scope.editAuth = false;
    $scope.readAuth = false;

    /**
     * 读取用户编辑权限以及返回读取当前单页
     */
    account.auths()
      .then(function (auths) {
        $scope.editAuth = auths.siteInfo.edit;
        $scope.readAuth = auths.siteInfo.read;
      }, function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '读取权限失败'
        });
      });

    /**
     * 获取网站配置
     */
    $http.get('/api/site-info')
      .success(function (result) {
        $scope.themes = result.themes;
        $scope.theme = result.siteInfo.theme || 'default';
        $scope.title = result.siteInfo.title;
        $scope.keywords = result.siteInfo.keywords;
        $scope.description = result.siteInfo.description;
        $scope.codeHeader = result.siteInfo.codeHeader;
        $scope.codeFooter = result.siteInfo.codeFooter;

        $scope.transmitting = false;
      })
      .error(function () {
        $scope.$emit('notification', {
          type: 'danger',
          message: '获取网站配置失败'
        });
      });

    /**
     * 更新网站配置
     */
    $scope.submitSiteInfo = function () {
      $scope.transmitting = true;

      $http.put('/api/site-info', {
        theme: $scope.theme,
        title: $scope.title,
        keywords: $scope.keywords,
        description: $scope.description,
        codeHeader: $scope.codeHeader,
        codeFooter: $scope.codeFooter
      })
      .success(function () {
        $scope.transmitting = false;

        $scope.$emit('notification', {
          type: 'success',
          message: '网站配置已保存'
        });
      })
      .error(function () {
        $scope.transmitting = false;

        $scope.$emit('notification', {
          type: 'danger',
          message: '网站配置保存失败'
        });
      });
    };
  }
]);