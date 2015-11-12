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
            // 没有登录
            case 'NOT_LOGGED_IN':
              $injector.get('$state').go('login');
              
              break;
            // 没有权限
            case 'NO_AUTHORITY':
              $injector.get('$state').go('main', {}, { reload: true });
          }
        }

        // 找不到用户或用户不存在
        if (rejection.status === 404 && rejection.data && rejection.data.error && rejection.data.error.code === 'USER_NOT_FOUND') {
          $injector.get('$state').go('login');
        }

        return $q.reject(rejection);
      }
    };
  }
]);