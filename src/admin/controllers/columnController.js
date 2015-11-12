/**
 * Column Controller
 */
angular.module('controllers').controller('columnController', ['$scope', '$stateParams', '$http',
  function ($scope, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.category = {};

    /**
     * 读取栏目
     */
    $http.get('/api/categories/' + $stateParams._id)
      .success(function (result) {
        $scope.category = result;
        console.log(result);
      });

  }
]);