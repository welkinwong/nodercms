/**
 * siteInfoController
 */
angular.module('controllers').controller('siteInfoController', ['$scope', '$http',
  function ($scope, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.title = '';
    $scope.keywords = '';
    $scope.description = '';
    $scope.translate = {
      on: false,
      key: ''
    };
    $scope.codeHeader = '';
    $scope.codeFooter = '';

    /**
     * 获取网站配置
     */
    $http.get('/api/siteInfo')
      .success(function (result) {
        $scope.title = result.title;
        $scope.keywords = result.keywords;
        $scope.description = result.description;
        $scope.translate = {
          on: result.translate && result.translate.on ? result.translate.on : false,
          key: result.translate && result.translate.key ? result.translate.key : ''
        };
        $scope.codeHeader = result.codeHeader;
        $scope.codeFooter = result.codeFooter;
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

      $http.put('/api/siteInfo', {
        title: $scope.title,
        keywords: $scope.keywords,
        description: $scope.description,
        translate: {
          on: $scope.translate.on,
          key: $scope.translate.key
        },
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