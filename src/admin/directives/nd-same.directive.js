/**
 * ndSame Directives
 * 验证两次输入是否相同
 */
angular.module('directives').directive('ndSame', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      element.add(attrs.ndSame).on('input', function () {
        scope.$apply(function () {
          var value = element.val() === $(attrs.ndSame).val();
          ctrl.$setValidity('same', value);
        });
      });
    }
  }
});