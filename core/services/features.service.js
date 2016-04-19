var async = require('async');
var _ = require('lodash');
var cache = require('../../lib/cache.lib');
var modelsModel = require('../models/models.model');
var featuresModel = require('../models/features.model');
var mediaModel = require('../models/media.model');

/**
 * 所有推荐
 * @param {Function} callback
 */
exports.all = function (callback) {
  featuresModel.find({})
    .select('model sort title link thumbnail extensions')
    .populate('thumbnail', 'fileName description date src')
    .exec(function (err, features) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      features = _.map(features, function (feature) {
        if (feature.thumbnail) var thumbnailSrc = feature.thumbnail.src;

        feature = feature.toObject();

        if (feature.thumbnail) feature.thumbnail.src = thumbnailSrc;

        return feature;
      });

      callback(err, features);
    });
};

/**
 * 单条推荐模型
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

  featuresModel.findById(_id)
    .select('model sort title link thumbnail extensions')
    .populate('thumbnail', 'fileName description date src')
    .exec(function (err, feature) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (feature.thumbnail) var thumbnailSrc = feature.thumbnail.src;

      feature = feature.toObject();

      if (feature.thumbnail) feature.thumbnail.src = thumbnailSrc;

      callback(null, feature);
    });
};

/**
 * 存储推荐
 * @param {Object} options
 *        {MongoId} options._id
 *        {Object} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  if (!options._id && !options.data) {
    var err = {
      type: 'system',
      error: '没有 _id 或 data 传入'
    };

    return callback(err);
  }

  var _id = options._id;
  var data = options.data;

  if (_id) {
    async.auto({
      feature: function (callback) {
        featuresModel.findByIdAndUpdate(_id, data, { runValidators: true }, function (err, oldFeature) {
          if (err) {
            err.type = 'database';
            callback(err);
          }

          callback(null, oldFeature);
        });
      },
      pullThumbnail: ['feature', function (callback, results) {
        if (results.feature.thumbnail !== data.thumbnail) {
          mediaModel.update({ _id: results.feature.thumbnail }, { $pull: { quotes: _id } }, { runValidators: true }, function (err) {
            callback(err);
          });
        } else {
          callback();
        }
      }],
      addThumbnail: ['feature', function (callback, results) {
        if (results.feature.thumbnail !== data.thumbnail) {
          mediaModel.update({ _id: data.thumbnail }, { $addToSet: { quotes: _id } }, { runValidators: true }, function (err) {
            callback(err);
          });
        } else {
          callback();
        }
      }]
    }, function (err) {
      callback(err);
    });
  } else {
    async.waterfall([
      //查询该推荐位模型
      function (callback) {
        modelsModel.findById(data.model, callback);
      },
      //判断是否超出模型条目数限制
      function (model, callback) {
        featuresModel.count({ model: data.model }, function (err, count) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          if (!_.get(model, 'mixed.items')) {
            callback({
              type: 'system',
              error: '找不到推荐模型条目数限制'
            });
          }

          if (count >= model.mixed.items) {
            callback({
              type: 'system',
              error: '超出推荐模型条目数限制'
            });
          } else {
            callback();
          }
        });
      },
      //新建推荐
      function (callback) {
        new featuresModel(data).save(function (err, feature) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }

          callback(null, feature);
        });
      },
      //增加媒体引用
      function (feature, callback) {
        if (data.thumbnail) {
          mediaModel.update({ _id: data.thumbnail }, { $addToSet: { quotes: feature._id } }, { runValidators: true }, function (err) {
            callback(err, feature);
          });
        } else {
          callback(null, feature);
        }
      }
    ], callback);
  }
};

/**
 * 删除推荐
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.remove = function (options, callback) {
  if (!options._id) {
    var err = {
      type: 'system',
      error: '没有 _id 传入'
    };

    return callback(err);
  }

  async.waterfall([
    function (callback) {
      featuresModel.findByIdAndRemove(options._id)
        .lean()
        .exec(function (err, oldFeature) {
          callback(err, oldFeature);
        });
    },
    function (oldFeature, callback) {
      if (oldFeature.thumbnail) {
        mediaModel.update({ _id: oldFeature.thumbnail }, { $pull: { quotes: options._id } }, { runValidators: true }, function (err) {
          callback(err, null);
        });
      } else {
        callback(null, null);
      }
    }
  ], function (err) {
    if (err) err.type = 'database';

    callback(err, null);
  });
};