/**
 * 拦截无权限请求
 */
angular.module('services').factory('authorityInterceptorService', ['$q', '$injector',
  function ($q, $injector) {
    'use strict';

    return {
      responseError: function (rejection) {
        if (rejection.status === 401 && rejection.data && rejection.data.error) {
          switch (rejection.data.error.code) {
            case 'NOT_LOGGED_IN':
              $injector.get('$state').go('login');
              
              break;
            case 'NO_AUTHORITY':
              $injector.get('$state').go('main');
          }
        }

        return $q.reject(rejection);
      }
    };
  }
]);