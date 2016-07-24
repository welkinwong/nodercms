/**
 * Words Filters
 * 截取字符串
 */
angular.module('filters').filter('words', function () {
  return function (str, words) {
    if (str && str.length > words) {
      str = str.substr(0, parseInt(words, 10) - 3) + '...';
    }

    return str;
  }
});