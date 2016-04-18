/**
 * thumbnailSrc Filters
 * 缩略图转 SRC
 */
angular.module('filters').filter('thumbnailSrc', function () {
  return function (thumbnail) {
    if (thumbnail) {
      return '/media/' + moment(thumbnail.date).format('YYYYMM') + '/' + thumbnail._id + '/' + thumbnail.fileName;
    } else {
      return;
    }
  }
});