/**
 * ndCallname Directives
 * 验证调用名是否可用
 */
angular.module('directives').directive('ndVcallname', ['$http',
  function ($http) {
    'use strict';

    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        ctrl.$setValidity('vcallname', true);

        function validate () {
          var callname = element.val();
          var oldCallname = scope.$eval(attrs.oldCallname);

          if (callname === oldCallname) {
            return ctrl.$setValidity('vCallname', true);
          }

          scope.inputing = false;
          scope.checkCallnameing = true;

          $http.get('/api/models', {
            params: {
              type: 'feature',
              'mixed.callname': callname
            }
          }).then(function (res) {
            if (res.data[0]) {
              ctrl.$setValidity('vcallname', false);
            } else {
              ctrl.$setValidity('vcallname', true);
            }

            scope.checkCallnameing = false;
          }, function () {
            scope.$emit('notification', {
              type: 'danger',
              message: '调用名验证未知错误'
            });

            scope.checkCallnameing = false;
          });
        }

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