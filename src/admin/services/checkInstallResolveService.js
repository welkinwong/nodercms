/**
 * 判断是否已安装
 */
angular.module('services').factory('checkInstallResolveService', ['$q', '$state', '$http',
  function ($q, $state, $http) {
    'use strict';

    return {
      leaveToLoginOrNone: function () {
        var deferred = $q.defer();

        $http.get('/api/install')
          .success(function () {
            deferred.resolve();
          })
          .error(function () {
            $state.go('login');
          });

        return deferred.promise;
      },
      enterToInstallOrNone: function () {
        var deferred = $q.defer();

        $http.get('/api/install')
          .success(function () {
            $state.go('install');
          })
          .error(function () {
            deferred.resolve();
          });

        return deferred.promise;
      }
    }
  }
]);