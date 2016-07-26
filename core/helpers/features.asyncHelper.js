var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var async = require('async');
var modelsModel = require('../models/models.model');
var featuresModel = require('../models/features.model');
var foreachHelper = require('../helpers/foreach.helper');

module.exports = function (callname, options, callback) {
  if (!options) {
    logger.system().error(__filename, 'options 不能为空');
    return callback();
  }

  async.waterfall([
    function (callback) {
      modelsModel.findOne({ type: 'feature', 'mixed.callname': callname }, function (err, model) {
        if (err) {
          return callback(err);
        }

        if (model) {
          callback(null, model);
        } else {
          var err = {
            type: 'database',
            error: '找不到该推荐模型'
          };

          callback(err);
        }
      });
    },
    function (model, callback) {
      featuresModel.find({ model: model._id })
        .select('sort title url thumbnail extensions')
        .populate('thumbnail', 'fileName description date src')
        .sort('sort')
        .exec(function (err, features) {
          if (err) return callback(err);

          features = _.map(features, function (feature) {
            if (feature.thumbnail) var thumbnailSrc = feature.thumbnail.src;

            feature = feature.toObject();

            if (feature.thumbnail) feature.thumbnail.src = thumbnailSrc;

            return feature;
          });

          callback(null, features);
        });
    }
  ], function (err, features) {
    if (err) {
      logger.system().error(__filename, err);
      return callback([]);
    }

    callback(foreachHelper(features, options));
  })
};