var async = require('async');
var _ = require('lodash');
var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');
var contentsService = require('../services/contents.service');
var listsService = require('../services/lists.service');

/**
 * 内容
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
module.exports = function (req, res, next) {
  if (!req.params[0]) return next();

  contentsService.one({
    alias: _(req.params[0]).split('/').last()
  }, function (err, content) {
    if (err) return res.status(500).end();

    if (!content) return next();

    var categoryPath = '/' + req.params.content + _(req.params[0]).split('/').initial().join('/');

    async.auto({
      siteInfo: siteInfoService.get,
      navigation: function (callback) {
        categoriesService.navigation({ current: categoryPath }, callback);
      },
      category: function (callback) {
        categoriesService.one({
          path: categoryPath,
          type: 'column'
        }, function (err, category) {
          if (err) return callback(err);
          if (!category) return callback('没有找到 Category');

          callback(null, category);
        });
      },
      localReadingTotal: ['category', function (callback, results) {
        listsService.reading({ _id: results.category._id }, callback);
      }],
      localReadingDay: ['category', function (callback, results) {
        listsService.reading({ _id: results.category._id, sort: '-reading.day' }, callback);
      }],
      localReadingWeek: ['category', function (callback, results) {
        listsService.reading({ _id: results.category._id, sort: '-reading.week' }, callback);
      }],
      localReadingMonth: ['category', function (callback, results) {
        listsService.reading({ _id: results.category._id, sort: '-reading.month' }, callback);
      }]
    }, function (err, results) {
      if (err && !results.category) return next();
      if (err) return res.status(500).end();

      res.render(_.get(results.category, 'views.content'), {
        layout: _.get(results.category, 'views.layout'),
        siteInfo: results.siteInfo,
        navigation: results.navigation,
        category: results.category,
        readingList: {
          total: results.localReadingTotal,
          day: results.localReadingDay,
          week: results.localReadingWeek,
          month: results.localReadingMonth
        },
        title: content.title,
        href: content.href,
        user: content.user,
        date: content.date,
        reading: content.reading,
        thumbnail: content.thumbnail,
        media: content.media,
        abstract: content.abstract,
        content: content.content,
        tags: content.tags,
        extensions: content.extensions
      });
    });
  });
};