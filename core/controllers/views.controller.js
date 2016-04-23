var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var path = require('path');
var logger = require('../../lib/logger.lib');
var siteInfoService = require('../services/site-info.service');

/**
 * 读取所有模板
 * @param {Object} req
 * @param {Object} res
 */
module.exports = function (req, res) {
  async.waterfall([
    function (callback) {
      siteInfoService.get(function (err, siteInfo) {
        if (err) return callback(err);

        if (siteInfo) {
          callback(err, siteInfo.theme || 'default');
        } else {
          callback(err, 'default');
        }
      });
    },
    function (theme, callback) {
      fs.readdir(path.join(__dirname, '../../public/themes/' + theme), function (err, files) {
        if (err) {
          err.type = 'system';
          return callback(err);
        }

        var views = _(files)
          .map(function (file) {
            var re = /.*(?=\.hbs$)/.exec(file);

            if (re) {
              return re[0];
            } else {
              return null;
            }
          })
          .compact();

        callback(null, views);
      });
    }
  ], function (err, views) {
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(400).end();
    }

    res.status(200).json(views);
  });
};