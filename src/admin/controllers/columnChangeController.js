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
	  $scope.translate = {
		  on: false,
		  key: ''
	  };

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
            result: [
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

	  /**
	   * 配置 Datepicker 控件
	   */
	  $('.input-group.date').datepicker({
		  todayBtn: "linked",
		  language: "zh-CN",
		  autoclose: true,
		  todayHighlight: true
	  });

	  /**
	   *
	   */
	  $http.get('/api/translate')
		  .success(function (resulat) {
			  $scope.translate = result;
		  })
		  .error(function () {
			  $scope.$emit('notification', {
				  type: 'danger',
				  message: '读取内容模型失败'
			  });
		  });
  }
]);