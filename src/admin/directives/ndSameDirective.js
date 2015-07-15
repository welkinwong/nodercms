/**
 * ndSame Directives
 * 验证两次输入是否相同
 */
angular.module('directives').directive('ndSame', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ctrl) {
      element.add(attr.ndSame).on('input', function () {
        scope.$apply(function () {
          var value = element.val() === $(attr.ndSame).val();
          ctrl.$setValidity('same', value);
        });
      });
    }
  }
});