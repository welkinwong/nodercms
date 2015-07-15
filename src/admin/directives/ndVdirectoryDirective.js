/**
 * ndVdirectory Directives
 * 验证目录是否可用
 */
angular.module('directives').directive('ndVdirectory', ['$http',
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
            if (scope.$eval(attr.ndVdirectory)) {
              scope.$apply(function () {
                scope.inputing = false;
                scope.checkDirectorying = true;

                var value = element.val().toLowerCase();

                var filter = [
                  'admin',
                  'api',
                  'openapi',
                  'open',
                  'assets',
                  'attachments'
                ];

                for (var i = 0; i < filter.length; i++) {
                  if (value === filter[i]) {
                    scope.checkDirectorying = false;

                    return ctrl.$setValidity('vdirectory', false);
                  }
                }

                $http.get('/api/categories', {
                  params: {
                    directory: value
                  }
                })
                .success(function (data) {
                  if (data[0]) {
                    ctrl.$setValidity('vdirectory', false);
                  } else {
                    ctrl.$setValidity('vdirectory', true);
                  }

                  scope.checkDirectorying = false;
                })
                .error(function () {
                  scope.$emit('notification', {
                    type: 'danger',
                    message: '目录名验证未知错误'
                  });

                  scope.checkDirectorying = false;
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