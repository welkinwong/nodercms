var async = require('async');
var _ = require('lodash');
var cache = require('../../lib/cache.lib');
var modelsModel = require('../models/models.model');

/**
 * 查询模型
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.query = function (options, callback) {
  var query = options.query;

  modelsModel.find(query)
    .select('type name description mixed system extensions')
    .lean()
    .exec(function (err, models) {
      if (err) err.type = 'database';

      callback(err, models);
    });
};

/**
 * 单个模型
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.one = function (options, callback) {
  if (!options._id) {
    var err = {
      type: 'system',
      error: '没有 _id 传入'
    };

    return callback(err);
  }

  var _id = options._id;

  modelsModel.findById(_id)
    .select('type name description mixed system extensions')
    .lean()
    .exec(function (err, model) {
      if (err) err.type = 'database';

      callback(err, model);
    });
};

/**
 * 存储模型
 * @param {Object} options
 *        {MongoId} options._id
 *        {Object} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  if (options._id) {
    modelsModel.update({ _id: options._id }, options.data, { runValidators: true }, function (err, model) {
      if (err) {
        err.type = 'database';
        callback(err);
      }

      cache.del('categories');

      callback(null, model);
    });
  } else {
    new modelsModel(options.data).save(function (err, model) {
      if (err) {
        err.type = 'database';
        callback(err);
      }

      cache.del('categories');

      callback(null, model);
    });
  }
};

/**
 * 删除模型
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.remove = function (options, callback) {
  modelsModel.remove({ _id: options._id }, function (err) {
    if (err) err.type = 'database';

    cache.del('categories');

    callback(err);
  });
};