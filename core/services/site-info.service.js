var logger = require('../../lib/logger.lib');
var cache = require('../../lib/cache.lib');
var optionsModel = require('../models/options.model');

/**
 * 网站信息
 * @param {Function} callback
 */
exports.get = function (callback) {
  var siteInfoCache = cache.get('siteInfo');

  if (siteInfoCache) {
    callback(null, siteInfoCache);
  } else {
    optionsModel.findOne({ name: 'siteInfo' }, function (err, siteInfo) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (siteInfo) {
        cache.set('siteInfo', siteInfo.value, 1000 * 60 * 60 * 24 * 30);

        callback(null, siteInfo.value);
      } else {
        callback(null);
      }
    });
  }
};

/**
 * 存储网站信息
 * @param {Object} options
 *        {Object} options.data
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  optionsModel.findOneAndUpdate({ name: 'siteInfo' }, {
    value: options.data
  }, { runValidators: true }, function (err) {
    if (err) {
      err.type = 'database';
      callback(err);
    }

    cache.del('siteInfo');

    callback(null);
  });
};