var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');
var listsService = require('../services/lists.service');

/**
 * 搜索页
 * @param {Object} req
 *        {String} req.query.words
 *        {String} req.query.page
 * @param {Object} res
 * @param {Function} next
 */
module.exports = function (req, res) {
  req.checkQuery({
    'words': {
      optional: true,
      isString: { errorMessage: 'words 需为字符串' }
    },
    'page': {
      optional: true,
      isString: { errorMessage: 'page 需为数字' }
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
      var query = {
        words: req.query.words,
        pageSize: 15
      };

      if (req.query.page) query.currentPage = parseInt(req.query.page);

      listsService.search(query, function (err, result) {
        if (err) return callback(err);

        if (!result) return callback();

        if (_.get(result, 'pagination.length') <= 1) {
          delete result.pagination
          return callback(null, result);
        }

        var pagination = _.map(result.pagination, function (page) {
          if (page.index === 1) {
            page.url = '/search?words=' + req.query.words;
          } else {
            page.url = '/search?words=' + req.query.words + '&page=' + page.index;
          }

          delete page.index;
          return page;
        });

        result.pagination = pagination;

        return callback(null, result);
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