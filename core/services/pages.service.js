var async = require('async');
var _ = require('lodash');
var marked = require('marked');
var logger = require('../../lib/logger.lib');
var moment = require('moment');
var cache = require('../../lib/cache.lib');
var categoriesModel = require('../models/categories.model');
var mediaModel = require('../models/media.model');
var categoriesService = require('../services/categories.service');

/**
 * 查询单页
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.path
 *        {Boolean} options.markdown
 * @param {Function} callback
 */
exports.one = function (options, callback) {
  if (!options._id && !options.path) {
    var err = {
      type: 'system',
      error: '没有 _id 或 path 传入'
    };

    return callback(err);
  }

  var query = {
    type: 'page'
  };

  if (options._id) query._id = options._id;
  if (options.path) query.path = options.path;
  var markdown = options.markdown || false;

  categoriesService.one(query, function (err, page) {
    if (err) {
      err.type = 'database';
      return callback(err);
    }

    if (!page) return callback();

    if (!markdown && _.get(page, 'mixed.pageContent')) {
      page.mixed.pageContent = marked(page.mixed.pageContent);
    }

    callback(null, page);
  });
};

/**
 * 存储单页
 * @param {Object} options
 *        {MongoId} options._id
 *        {Data} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  if (!options.data) {
    var err = {
      type: 'system',
      error: '没有 data 传入'
    };

    return callback(err);
  }

  var data = options.data;
  var _id = options._id || null;

  var newMedia = [];
  if (_.get(data, 'mixed.pageMedia')) newMedia = data['mixed.pageMedia'];

  async.auto({
    updatePage: function (callback) {
      categoriesModel.findByIdAndUpdate(_id, data, { runValidators: true }, function (err, oldPage) {
        callback(err, oldPage);
      });
    },
    pullMedia: ['updatePage', function (callback, results) {
      var pullMedia = _.difference(_.map(_.get(results, 'updatePage.mixed.pageMedia'), function (medium) {
        return medium.toString()
      }), newMedia);

      mediaModel.update({_id: {$in: pullMedia}}, {$pull: {quotes: _id}}, {
        multi: true,
        runValidators: true
      }, function (err) {
        callback(err);
      });
    }],
    addMedia: ['updatePage', function (callback, results) {
      var addMedia = _.difference(newMedia, _.map(_.get(results, 'updatePage.mixed.pageMedia'), function (medium) {
        return medium.toString()
      }));

      mediaModel.update({ _id: { $in: addMedia } }, { $addToSet: { quotes: _id } }, {
        multi: true,
        runValidators: true
      }, function (err) {
        callback(err);
      });
    }]
  }, function (err) {
    if (err) {
      err.type = 'database';
      return callback(err);
    }

    cache.del('categories');

    callback();
  });
};