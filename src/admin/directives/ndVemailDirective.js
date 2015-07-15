/**
 * ndVemail Directives
 * 验证邮箱是否已被注册
 */
angular.module('directives').directive('ndVemail', ['$http',
  function ($http) {
    'use strict';

    return {
      require: 'ngModel',
      link: function (scope, element, attr, ctrl) {
        element
          .on('input', function () {
            scope.$apply(function () {
              scope.inputing = true;
            });
          })
          .on('blur', function () {
            if (scope.$eval(attr.ndVemail)) {
              scope.$apply(function () {
                scope.inputing = false;
                scope.checkEmailing = true;

                $http.get('/api/users', {
                  params: {
                    email: element.val()
                  }
                })
                .success(function (data) {
                  if (data[0]) {
                    ctrl.$setValidity('vemail', false);
                  } else {
                    ctrl.$setValidity('vemail', true);
                  }

                  scope.checkEmailing = false;
                })
                .error(function () {
                  scope.$emit('notification', {
                    type: 'danger',
                    message: '邮箱验证未知错误'
                  });

                  scope.checkEmailing = false;
                });
              });
            } else {
              scope.$apply(function () {
                ctrl.$setValidity('vemail', true);
              });
            }
          });
      }
    }
  }
]);