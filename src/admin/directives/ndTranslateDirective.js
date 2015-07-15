/**
 * ndTranslate Directives
 * 验证百度翻译 API 是否正确
 */
angular.module('directives').directive('ndTranslate', ['$http',
  function ($http) {
    'use strict';

    return {
      require: 'ngModel',
      link: function (scope, element, attr, ctrl) {
        element
          .on('input', function () {
            scope.$apply(function () {
              scope.translateOnShow = false;
            });
          })
          .on('blur', function () {
            scope.$apply(function () {
              scope.checkTranslateing = true;

              $http.jsonp('http://openapi.baidu.com/public/2.0/bmt/translate', {
                params: {
                  from: 'zh',
                  to: 'en',
                  client_id: element.val(),
                  q: '你好',
                  callback: 'JSON_CALLBACK'
                }
              })
              .success(function (data) {
                scope.checkTranslateing = false;

                if (data.error_code) {
                  scope.translate.on = false;
                  scope.translateOnShow = false;

                  switch (data.error_code) {
                    case '52001':
                      scope.$emit('notification', {
                        type: 'danger',
                        message: '百度翻译 API 检测超时'
                      });
                      break;
                    case '52002':
                      scope.$emit('notification', {
                        type: 'danger',
                        message: '百度翻译 API 系统错误'
                      });
                      break;
                    case '52003':
                      scope.$emit('notification', {
                        type: 'danger',
                        message: '百度翻译 Key 不正确'
                      });
                      break;
                  }

                  ctrl.$setValidity('translate', false);
                  return;
                }

                scope.$emit('notification', {
                  type: 'success',
                  message: '百度翻译 API Key正确'
                });

                scope.translateOnShow = true;
                ctrl.$setValidity('translate', true);
              })
              .error(function () {
                scope.checkTranslateing = false;

                scope.$emit('notification', {
                  type: 'danger',
                  message: '百度翻译 API 未知错误'
                });

                scope.translateOnShow = false;
                scope.translate.on = false;
                ctrl.$setValidity('translate', false);
              });
            });
          });
      }
    }
  }
]);