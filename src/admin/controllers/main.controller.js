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
		$scope.officialSystemInfo = {};
		$scope.nodeInfo = {};
		$scope.databaseInfo = {};
		$scope.contentsTotal = '';
		$scope.mediaTotal = '';
		$scope.adminsTotal = '';
		$scope.readingList = {};
		$scope.versionIsLatest = true;
    $scope.sponsor = 99;

		$http.get('/api/dashboard')
			.then(function (res) {
				var data = res.data;

				$scope.systemInfo = data.systemInfo;
				$scope.nodeInfo = data.nodeInfo;
				$scope.databaseInfo = data.databaseInfo;
				$scope.contentsTotal = data.contentsTotal;
				$scope.mediaTotal = data.mediaTotal;
				$scope.adminsTotal = data.adminsTotal;
				$scope.readingList = data.readingList;
			}, function () {
				$scope.$emit('notification', {
					type: 'danger',
					message: '读取控制面板数据失败'
				});
			});

		/**
		 * NoderCMS 官方信息
		 */
		$http.get('http://console.nodercms.com/openApi/info')
			.then(function (res) {
				var data = res.data;

				$scope.officialSystemInfo = data;
			}, function () {
				$scope.$emit('notification', {
					type: 'danger',
					message: '官方信息读取失败'
				});
			});

		/**
		 * 比较是否最新版本
		 */
		$scope.compareVersion = function (version, officialVersion) {
			return officialVersion && version !== officialVersion ? true : false;
		};

		/**
		 * 统计
		 */
		$http.put('/api/statistics', {
			hostname: $scope.website.hostname
		});
	}
]);