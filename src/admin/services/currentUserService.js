/**
 * 获取用户信息
 */
angular.module('services').factory('currentUserService', ['$http', '$q',
  function ($http, $q) {
    'use strict';

	  var deferred = $q.defer();

	  $http.get('/api/currentUser')
		  .success(function (result) {
			  deferred.resolve(result);
		  })
		  .error(function (result) {
			  deferred.reject(result);
		  });

	  return deferred.promise;
  }
]);