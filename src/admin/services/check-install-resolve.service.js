/**
 * 判断是否已安装
 */
angular.module('services').factory('checkInstallResolve', ['$q', '$state', '$http',
  function ($q, $state, $http) {
    'use strict';

    return {
      leaveToSignInOrNone: function () {
        var deferred = $q.defer();

        $http.get('/api/install')
          .then(function (res) {
            var data = res.data;

            if (!data.hasInstall) {
              deferred.resolve();
            } else {
              $state.go('signIn');
            }
          }, function () {
            $state.go('signIn');
          });

        return deferred.promise;
      },
      enterToInstallOrNone: function () {
        var deferred = $q.defer();

        $http.get('/api/install')
          .then(function (res) {
            var data = res.data;

            if (!data.hasInstall) {
              $state.go('install');
            } else {
              deferred.resolve();
            }
          }, function () {
            deferred.resolve();
          });


        return deferred.promise;
      }
    }
  }
]);