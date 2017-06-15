var async = require('async');
var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');
var listsService = require('../services/lists.service');

/**
 * 栏目
 * @param {Object} req
 *        {String} req.query.page
 * @param {Object} res
 * @param {Function} next
 */
module.exports = function (req, res, next) {
  req.checkQuery({
    'page': {
      optional: true,
      isInt: { errorMessage: 'page 需为 mongoId' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  categoriesService.one({
    path: '/' + req.params.column + req.params[0],
    type: 'column'
  }, function (err, category) {
    if (err) return res.status(500).end();

    if (!category) return next();

    async.parallel({
      siteInfo: siteInfoService.get,
      navigation: function (callback) {
        categoriesService.navigation({ current: category.path }, callback);
      },
      list: function (callback) {
        var query = {
          _id: category._id
        };

        if (_.get(category, 'mixed.pageSize')) query.pageSize = category.mixed.pageSize;
        if (req.query.page) query.currentPage = parseInt(req.query.page);

        listsService.column(query, function (err, result) {
          if (err) return callback(err);

          if (_.get(result, 'pagination.length') <= 1) {
            delete result.pagination
            return callback(null, result);
          }

          var pagination = _.map(result.pagination, function (page) {
            if (page.index === 1) {
              page.url = category.path;
            } else {
              page.url = category.path + '?page=' + page.index;
            }

            delete page.index;
            return page;
          });

          result.pagination = pagination;

          callback(null, result);
        });
      },
      localReadingTotal: function (callback) {
        listsService.reading({ _id: category._id }, callback);
      },
      localReadingDay: function (callback) {
        listsService.reading({ _id: category._id, sort: '-reading.day' }, callback);
      },
      localReadingWeek: function (callback) {
        listsService.reading({ _id: category._id, sort: '-reading.week' }, callback);
      },
      localReadingMonth: function (callback) {
        listsService.reading({ _id: category._id, sort: '-reading.month' }, callback);
      }
    }, function (err, results) {
      if (err) return res.status(500).end();

      res.render(_.get(category, 'views.column'), {
        layout: _.get(category, 'views.layout'),
        siteInfo: results.siteInfo,
        navigation: results.navigation,
        category: category,
        list: results.list,
        readingList: {
          total: results.localReadingTotal,
          day: results.localReadingDay,
          week: results.localReadingWeek,
          month: results.localReadingMonth
        }
      });
    });
  });
};