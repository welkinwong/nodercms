var async = require('async');
var logger = require('../../lib/logger.lib');
var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');

/**
 * 404 错误
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.notFound = function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/**
 * 其他错误
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.error = function (err, req, res, next) {
  if (err && err.status !== 404) {
    logger.system().error(err);
  }

  async.parallel({
    siteInfo: siteInfoService.get,
    navigation: function (callback) {
      categoriesService.navigation({}, callback);
    }
  }, function (_err, results) {
    if (_err) {
      logger[_err.type]().error(__filename, _err);
      return res.status(500).end();
    }

    var views = '';

    if (err.status === 404) {
      views = '404';
    } else {
      views = 'error';
    }

    res.render(views, {
      layout: 'layout-default',
      siteInfo: results.siteInfo,
      navigation: results.navigation
    });
  });
};