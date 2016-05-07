/**
 * ndVdirectory Directives
 * 验证目录是否可用
 */
angular.module('directives').directive('ndVdirectory', ['$http',
  function ($http) {
    'use strict';

    return {
      require: 'ngModel',
      scope: {
        prePath: '=',
        oldPath: '='
      },
      link: function (scope, element, attrs, ctrl) {
        ctrl.$setValidity('vdirectory', true);

        function validate () {
          var prePath = scope.prePath;
          var directory = element.val().toLowerCase();
          var oldPath = scope.oldPath;

          scope.inputing = false;
          scope.checkDirectorying = true;

          var filter = [
            'admin',
            'api',
            'openapi',
            'open',
            'themes',
            'media',
            'assets'
          ];

          if (!prePath) {
            for (var i = 0; i < filter.length; i++) {
              if (directory === filter[i]) {
                scope.checkDirectorying = false;

                return ctrl.$setValidity('vdirectory', false);
              }
            }
          }

          var paramsPath;

          if (prePath) {
            paramsPath = prePath + '/' + directory;
          } else {
            paramsPath = '/' + directory;
          }

          if (paramsPath === oldPath) {
            return ctrl.$setValidity('vdirectory', true);
          }

          $http.get('/api/categories', {
            params: { path: paramsPath }
          }).then(function (res) {
            var data = res.data;

            if (data) {
              ctrl.$setValidity('vdirectory', false);
            } else {
              ctrl.$setValidity('vdirectory', true);
            }

            scope.checkDirectorying = false;
          }, function () {
            scope.$emit('notification', {
              type: 'danger',
              message: '目录名验证未知错误'
            });

            scope.checkDirectorying = false;
          });
        }

        scope.$watch('prePath', function (newValue, oldValue) {
          if (newValue !== oldValue) validate();
        });

        element
          .on('input', function () {
            scope.$apply(function () {
              scope.inputing = true;
            });
          })
          .on('blur', function () {
            scope.$apply(function () {
              validate();
            });
          });
      }
    }
  }
]);