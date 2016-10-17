var async = require('async');
var _ = require('lodash');
var cache = require('../../lib/cache.lib');
var modelsModel = require('../models/models.model');
var featuresModel = require('../models/features.model');
var mediaModel = require('../models/media.model');

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
    .select('model sort title url thumbnail media extensions')
    .populate('thumbnail', 'fileName description date src')
    .populate('media', 'fileName description date src')
    .exec(function (err, feature) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (feature.thumbnail) var thumbnailSrc = feature.thumbnail.src;
      if (!_.isEmpty(feature.media)) var meiaSrc = _.map(feature.media, 'src');

      feature = feature.toObject();

      if (feature.thumbnail) feature.thumbnail.src = thumbnailSrc;
      if (!_.isEmpty(feature.media)) {
        _.forEach(feature.media, function (medium, index) {
          medium.src = meiaSrc[index];
        });
      }

      callback(null, feature);
    });
};

/**
 * 所有推荐
 * @param {Function} callback
 */
exports.all = function (callback) {
  featuresModel.find({})
    .select('model sort title url thumbnail media extensions')
    .populate('thumbnail', 'fileName description date src')
    .populate('media', 'fileName description date src')
    .exec(function (err, features) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      features = _.map(features, function (feature) {
        if (feature.thumbnail) var thumbnailSrc = feature.thumbnail.src;
        if (!_.isEmpty(feature.media)) var meiaSrc = _.map(feature.media, 'src');

        feature = feature.toObject();

        if (feature.thumbnail) feature.thumbnail.src = thumbnailSrc;
        if (!_.isEmpty(feature.media)) {
          _.forEach(feature.media, function (medium, index) {
            medium.src = meiaSrc[index];
          });
        }

        return feature;
      });

      callback(err, features);
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
      pullMedia: ['feature', function (callback, results) {
        if (_.isEmpty(data.media)) data.media = [];

        var oldMedia = results.feature.media;
        var newMedia = data.media;
        var oldThumbnail = results.feature.thumbnail;
        var newThumbnail = data.thumbnail;

        // 待解除引用列表
        // 相比旧的 media 缺少的部分
        var pullMedia = _.difference(_.map(oldMedia, function (medium) {
          return medium.toString()
        }), newMedia);

        if (oldThumbnail) {
          var isQuote = _.find(newMedia, function (medium) {
            return medium === oldThumbnail.toString();
          });

          if (!isQuote) pullMedia.push(oldThumbnail.toString());
        }

        if (newThumbnail) {
          _.pull(pullMedia, newThumbnail);
        }

        mediaModel.update({_id: {$in: pullMedia}}, {$pull: {quotes: _id}}, {
          multi: true,
          runValidators: true
        }, function (err) {
          callback(err);
        });
      }],
      addMedia: ['feature', function (callback, results) {
        if (_.isEmpty(data.media)) data.media = [];

        var oldMedia = results.feature.media;
        var newMedia = data.media;
        var oldThumbnail = results.feature.thumbnail;
        var newThumbnail = data.thumbnail;

        var addMedia = _.difference(newMedia, _.map(oldMedia, function (medium) {
          return medium.toString()
        }));

        if (newThumbnail && oldThumbnail && newThumbnail === oldThumbnail.toString()) {
          _.pull(addMedia, newThumbnail);
        }

        if ((newThumbnail && !oldThumbnail) || (oldThumbnail && (newThumbnail !== oldThumbnail.toString()))) {
          addMedia.push(newThumbnail);
        }

        mediaModel.update({_id: {$in: addMedia}}, {$addToSet: {quotes: _id}}, {
          multi: true,
          runValidators: true
        }, function (err) {
          callback(err);
        });
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

          if (!_.get(model, 'mixed.limit')) {
            callback({
              type: 'system',
              error: '找不到推荐模型条目数限制'
            });
          }

          if (count >= model.mixed.limit) {
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
          callback(err, feature);
        });
      },
      //增加媒体引用
      function (feature, callback) {
        if (data.thumbnail) {
          data.media = data.media || [];
          data.media.push(data.thumbnail);
        }

        mediaModel.update({ _id: { $in: _.uniq(data.media) } }, { $addToSet: { quotes: feature._id } }, {
          multi: true,
          runValidators: true
        }, function (err) {
          callback(err);
        });
      }
    ], function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback();
    });
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

  var _id = options._id;

  featuresModel.findByIdAndRemove(_id)
    .lean()
    .exec(function (err, oldFeature) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (!oldFeature) return callback();

      if (oldFeature.thumbnail) oldFeature.media.push(oldFeature.thumbnail);

      mediaModel.update({ _id: { $in: oldFeature.media } }, { $pull: { quotes: _id } }, {
        multi: true,
        runValidators: true
      }, function (err) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        callback(err, null);
      });
    });
};