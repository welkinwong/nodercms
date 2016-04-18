/**
 * 检查用户是否登录
 */
angular.module('services').factory('checkSignIn', ['$rootScope', '$state', 'ipCookie',
  function ($rootScope, $state, ipCookie) {
    'use strict';
    
    return function () {
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if (!ipCookie('nodercmsSid') && toState.name !== 'signIn' && toState.name !== 'install') {
          event.preventDefault();
          $state.go('signIn');
        }
      });
    };
  }
]);