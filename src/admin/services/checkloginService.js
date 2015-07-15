/**
 * 检查用户是否登录
 */
angular.module('services').factory('checkloginService', ['$rootScope', '$state', 'ipCookie',
  function ($rootScope, $state, ipCookie) {
    'use strict';
    
    return function () {
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if (!ipCookie('nodercmsSid') && toState.name !== 'login' && toState.name !== 'install') {
          event.preventDefault();
          $state.go('login');
        }
      });
    };
  }
]);