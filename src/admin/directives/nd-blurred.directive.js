/**
 * ndBlurred Directives
 * 失去焦点验证
 */
angular.module('directives').directive('ndBlurred', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      ctrl.$blurred = true;

      element
        .on('focus', function () {
          scope.$apply(function () {
            ctrl.$blurred = false;
          });
        })
        .on('blur', function () {
          scope.$apply(function () {
            ctrl.$blurred = true;
          });
        });
    }
  }
});