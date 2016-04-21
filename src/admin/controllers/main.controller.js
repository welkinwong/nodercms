/**
 * Main Controller
 */
angular.module('controllers').controller('main', ['$scope', '$http',
	function ($scope, $http) {
		'use strict';

		/**
		 * 初始化变量
		 */
		$scope.website = {
			hostname: window.location.hostname,
			origin: window.location.origin
		};
		$scope.systemInfo = {};
		$scope.nodeInfo = {};
		$scope.databaseInfo = {};
		$scope.contentTotal = '';
		$scope.mediaTotal = '';
		$scope.adminsTotal = '';
		$scope.readingList = {};

		$http.get('/api/dashboard')
			.then(function (res) {
				var data = res.data;

				$scope.systemInfo = data.systemInfo;
				$scope.nodeInfo = data.nodeInfo;
				$scope.databaseInfo = data.databaseInfo;
				$scope.contentTotal = data.contentTotal;
				$scope.mediaTotal = data.mediaTotal;
				$scope.adminsTotal = data.adminsTotal;
				$scope.readingList = data.readingList;
			}, function () {
				$scope.$emit('notification', {
					type: 'danger',
					message: '读取控制面板数据失败'
				});
			});
	}
]);