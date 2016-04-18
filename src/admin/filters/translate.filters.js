/**
 * Translate Filters
 * 翻译字符串
 */
angular.module('filters').filter('translate', function () {
  return function (input, options) {
    if (!_.isObject(options) || !options.display || !options.same || !options.source) {
      return input;
    }

    var target = _.find(options.source, function (item) {
        return item[options.same] == input;
    });

    return target[options.display];
  }
});