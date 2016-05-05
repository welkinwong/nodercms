/**
 * 检查用户权限
 */
angular.module('services').factory('checkAuthResolve', ['$rootScope', '$q', '$state', 'account',
  function ($rootScope, $q, $state, account) {
    'use strict';

		return function (category, action) {
			var deferred = $q.defer();

			account.auths()
				.then(function (auths) {
					if (auths[category][action]) {
						deferred.resolve();
					} else {
						account.reset();
						$state.go('main', null, { reload: 'main' });
					}
				}, function () {
					account.reset();
					$rootScope.$emit('notification', {
						type: 'danger',
						message: '读取权限失败'
					});
				});

			return deferred.promise;
		};
  }
]);