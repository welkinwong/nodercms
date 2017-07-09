/**
 * Install Controller
 */
angular.module('controllers').controller('install', ['$scope', '$state', '$http', '$timeout',
  function ($scope, $state, $http, $timeout) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.page = 'license';
    $scope.databaseHost = 'localhost';
    $scope.databasePort = 27017;
    $scope.database = 'nodercms';
    $scope.databaseUser = '';
    $scope.databasePassword = '';
    $scope.databaseError = false;
    $scope.themes = [];
    $scope.theme = 'default';
    $scope.themeError = false;
    // 导入示例数据，下一版本
    //$scope.case = true;
    $scope.title = '';
    $scope.email = '';
    $scope.nickname = '';
    $scope.password = '';
    $scope.siteInfoError = false;
    $scope.hasInstall = false;
    $scope.installingTimeout = null;
    $scope.installingPoll = null;
    $scope.sponsor = 99;

    /**
     * 读取主题
     */
    $scope.loadThemes = function () {
      $http.get('/api/install/themes')
        .then(function (res) {
          var data = res.data;

          $scope.themes = data;
          $scope.themeError = false;
        }, function () {
          $scope.themeError = true;
        });
    }; $scope.loadThemes();

    /**
     * 检查数据库连接
     */
    $scope.testDatabase = function () {
      $scope.transmitting = true;

      var data = {
        host: $scope.databaseHost,
        port: $scope.databasePort,
        db: $scope.database,
        user: $scope.databaseUser,
        pass: $scope.databasePassword
      };

      $http.put('/api/install/test-database', data)
        .then(function () {
          $scope.transmitting = false;
          $scope.databaseError = false;

          $scope.page = 'siteInfo';
        }, function () {
          $scope.transmitting = false;
          $scope.databaseError = true;
        });
    };

    /**
     * 提交 install
     */
    $scope.submitInstall = function () {
      $scope.transmitting = true;
      $scope.installing();

      var data = {
        databaseHost: $scope.databaseHost,
        databasePort: $scope.databasePort,
        database: $scope.database,
        databaseUser: $scope.databaseUser,
        databasePassword: $scope.databasePassword,
        // 导入示例数据，下一版本
        //case: $scope.case,
        title: $scope.title,
        theme: $scope.theme,
        email: $scope.email.toLowerCase(),
        nickname: $scope.nickname,
        password: $scope.password
      };

      $http.post('/api/install', data)
        .then(function () {
          $scope.hasInstall = true;
        }, function () {
          if ($scope.installingTimeout) $timeout.cancel($scope.installingTimeout);
          if ($scope.installingPoll) $timeout.cancel($scope.installingPoll);
          $scope.transmitting = false;
          $scope.siteInfoError = true;
          $scope.page = 'siteInfo';
        });
    };

    $scope.installing = function () {
      $scope.page = 'installing';

      $scope.installingTimeout = $timeout(function poll () {
        if (!$scope.hasInstall) {
          $scope.installingPoll = $timeout(poll, 1000);
        } else {
          $scope.page = 'installed';
        }
      }, 1000);
    };
  }
]);