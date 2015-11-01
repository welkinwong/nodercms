/**
 * Column Change Controller
 */
angular.module('controllers').controller('columnChangeController', ['$scope', '$stateParams', '$http',
  function ($scope, $stateParams, $http) {
    'use strict';

    /**
     * 初始化变量
     */
    $scope.transmitting = false;
    $scope.action = 'create';

    /**
     * 配置 Markdown 编辑器
     */
    $("#content").markdown({
      resize: 'vertical',
      iconlibrary: 'fa',
      language: 'zh',
      buttons: [
        [
          {},
          {
            data: [
              {},
              {
                callback: function (e) {
                  alert(111)
                }
              }
            ]
          }
        ]
      ]
    });

  }
]);