var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');
var listsService = require('../services/lists.service');

/**
 * 搜索页
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
module.exports = function (req, res, next) {
  req.checkQuery({
    'words': {
      optional: true,
      isString: { errorMessage: 'words 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  async.parallel({
    siteInfo: siteInfoService.get,
    navigation: function (callback) {
      categoriesService.navigation({ current: '/search' }, callback);
    },
    list: function (callback) {
      listsService.search({ words: req.query.words }, function (err, list) {
        if (err) return callback(err);

        if (!list) return callback();

        return callback(null, list);
      });
    },
    readingTotal: function (callback) {
      listsService.reading({}, callback);
    },
    readingDay: function (callback) {
      listsService.reading({ sort: '-reading.day' }, callback);
    },
    readingWeek: function (callback) {
      listsService.reading({ sort: '-reading.week' }, callback);
    },
    readingMonth: function (callback) {
      listsService.reading({ sort: '-reading.month' }, callback);
    }
  }, function (err, results) {
    res.render('search', {
      layout: 'layout-default',
      siteInfo: results.siteInfo,
      navigation: results.navigation,
      list: results.list,
      readingList: {
        total: results.readingTotal,
        day: results.readingDay,
        week: results.readingWeek,
        month: results.readingMonth
      }
    });
  });
};