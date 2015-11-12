/**
 * mainController
 */
angular.module('controllers').controller('mainController', ['$rootScope', '$scope', '$state', '$http', 'currentUser',
	function ($rootScope, $scope, $state, $http, currentUser) {
    /**
     * 初始化变量
     */
    $rootScope.currentUser = currentUser;

	}
]);